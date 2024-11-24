package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"sort"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
)

// UserAccount struct represents user account information including personal and bank details
type UserAccount struct {
	Username    string `json:"username,omitempty"`
	Password    string `json:"password,omitempty"`
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	IDCard      string `json:"id_card"`
	DOB         string `json:"dob"`
	PhoneNo     string `json:"phone_no"`
	Address     string `json:"address"`
	BankName    string `json:"bank_name,omitempty"`
	BankAccNo   string `json:"bank_acc_no,omitempty"`
	CreditScore int    `json:"credit_score,omitempty"`
}

// Admin struct represents admin information
type Admin struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// LoanRequest struct represents the data needed to apply for a loan
type LoanRequest struct {
	UserID        int     `json:"user_id"`
	InitialAmount float64 `json:"initial_amount"`
	DueDateTime   string  `json:"due_date_time"` // expected format: "2006-01-02 15:04"
}

// LoanResponse struct represents the response after applying for a loan
type LoanResponse struct {
	LoanID         int     `json:"loan_id"`
	TotalAmount    float64 `json:"total"`
	DueDateTime    string  `json:"due_date_time"`
	InitialAmount  float64 `json:"initial_amount"`
	InterestRate   float64 `json:"interest_rate"`
	InterestAmount float64 `json:"interest"`
	Status         string  `json:"status"`
}

type UserInfoForAdmin struct {
	Username        string  `json:"username"`
	TotalLoan       float64 `json:"total_loan"`
	TotalLoanRemain float64 `json:"total_loan_remain"`
	RiskLevel       string  `json:"risk_level"`
}

// Database struct wraps the SQL database connection
type Database struct {
	*sql.DB
}

// HELPER FUNCTIONS
func calculateInterestRate(amount float64) float64 {
	switch {
	case amount > 20000:
		return 0.05 // 5%
	case amount > 10000:
		return 0.04 // 4%
	default:
		return 0.03 // 3%
	}
}

func calculateLoanDetails(amount float64, dueDate time.Time) (totalAmount float64, interestAmount float64, interestRate float64) {
	interestRate = calculateInterestRate(amount)
	durationDays := int(time.Until(dueDate).Hours() / 24)
	if durationDays > 365 {
		interestRate += 0.01 // long-term loan penalty
		interestRate = roundToTwoDecimalPlaces(interestRate)
	}

	interestAmount = amount * interestRate
	totalAmount = amount + interestAmount
	return totalAmount, interestAmount, interestRate
}

func roundToTwoDecimalPlaces(value float64) float64 {
	return math.Round(value*100) / 100
}

//ACCOUNT

// Signup function to create a new account
func (db *Database) Signup(userAccount UserAccount) error {
	// Check if the username already exists
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM account WHERE Username = ?)`
	err := db.QueryRow(query, userAccount.Username).Scan(&exists)
	if err != nil {
		return fmt.Errorf("checking username existence: %w", err)
	}
	if exists {
		return fmt.Errorf("username %s is already taken", userAccount.Username)
	}

	// Hash the password if it is provided
	var hashedPassword []byte
	if userAccount.Password != "" {
		hashedPassword, err = bcrypt.GenerateFromPassword([]byte(userAccount.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hashing password: %w", err)
		}
	}

	// Insert account into the database
	accountQuery := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
	result, err := db.Exec(accountQuery, userAccount.Username, hashedPassword)
	if err != nil {
		return fmt.Errorf("inserting account: %w", err)
	}

	// Get the last insert ID
	accountID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("getting last insert ID: %w", err)
	}

	// Insert user details into the user table
	userQuery := `INSERT INTO user (AccountID, FirstName, LastName, IDCard, DOB, PhoneNo, Address, CreditScore, BankName, BankAccNo) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
	_, err = db.Exec(userQuery, accountID, userAccount.FirstName, userAccount.LastName, userAccount.IDCard, userAccount.DOB, userAccount.PhoneNo, userAccount.Address, userAccount.BankName, userAccount.BankAccNo)
	if err != nil {
		return fmt.Errorf("inserting user: %w", err)
	}

	return nil
}

// DeleteAccount deletes an account and all related information.
// It handles both user and admin accounts.
func (db *Database) DeleteAccount(accountID int) error {
	var userID sql.NullInt64  // To handle nullable UserID.
	var adminID sql.NullInt64 // To handle nullable AdminID.

	// Check for UserID and AdminID associated with the AccountID.
	err := db.QueryRow(`
		SELECT 
			(SELECT UserID FROM user WHERE AccountID = ?) AS UserID,
			(SELECT AdminID FROM loansharkadmin WHERE AccountID = ?) AS AdminID
	`, accountID, accountID).Scan(&userID, &adminID)
	if err != nil {
		return fmt.Errorf("fetching UserID or AdminID for AccountID %d: %w", accountID, err)
	}

	if userID.Valid { // Account belongs to a user.
		// Check for pending loans.
		var pendingLoans int
		query := `SELECT COUNT(*) FROM loan WHERE UserID = ? AND Status = 'pending'`
		err = db.QueryRow(query, userID.Int64).Scan(&pendingLoans)
		if err != nil {
			return fmt.Errorf("checking pending loans: %w", err)
		}

		if pendingLoans > 0 {
			return fmt.Errorf("cannot delete account with pending loans")
		}

		// Delete payments related to the user's loans.
		_, err = db.Exec(`DELETE FROM payment WHERE LoanID IN (SELECT LoanID FROM loan WHERE UserID = ?)`, userID.Int64)
		if err != nil {
			return fmt.Errorf("deleting payments: %w", err)
		}

		// Delete loans related to the user.
		_, err = db.Exec(`DELETE FROM loan WHERE UserID = ?`, userID.Int64)
		if err != nil {
			return fmt.Errorf("deleting loans: %w", err)
		}

		// Delete the user from the user table.
		_, err = db.Exec(`DELETE FROM user WHERE AccountID = ?`, accountID)
		if err != nil {
			return fmt.Errorf("deleting user: %w", err)
		}
	}

	if adminID.Valid { // Account belongs to an admin.
		// Delete admin-specific data.
		_, err = db.Exec(`DELETE FROM loansharkadmin WHERE AccountID = ?`, accountID)
		if err != nil {
			return fmt.Errorf("deleting from admin table: %w", err)
		}
	}

	// Delete the account itself from the account table.
	_, err = db.Exec(`DELETE FROM account WHERE AccountID = ?`, accountID)
	if err != nil {
		return fmt.Errorf("deleting account: %w", err)
	}

	return nil
}

// Login function for user login
func (db *Database) Login(username, password string) (map[string]interface{}, error) {
	var storedHash string
	var accountID int64
	var isAdmin int          // Use an int to store the admin count
	var userID sql.NullInt64 // To handle nullable UserID

	// Query to get stored password hash and account ID
	query := `SELECT PasswordHash, AccountID FROM account WHERE Username = ?`
	err := db.QueryRow(query, username).Scan(&storedHash, &accountID)
	if err != nil {
		return nil, fmt.Errorf("querying for username %s: %w", username, err)
	}

	// Compare the provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid credentials: %w", err)
	}

	// Check if the user is an admin
	adminQuery := `SELECT COUNT(*) FROM loansharkadmin WHERE AccountID = ?`
	err = db.QueryRow(adminQuery, accountID).Scan(&isAdmin)
	if err != nil {
		return nil, fmt.Errorf("checking admin status: %w", err)
	}

	// Determine the role and fetch UserID if not an admin
	role := "user"
	var userData map[string]interface{}

	if isAdmin > 0 {
		role = "admin"
		userData = map[string]interface{}{
			"role": role,
		}
	} else {
		// Fetch the UserID associated with the account
		userQuery := `SELECT UserID FROM user WHERE AccountID = ?`
		err = db.QueryRow(userQuery, accountID).Scan(&userID)
		if err != nil && err != sql.ErrNoRows {
			return nil, fmt.Errorf("fetching UserID: %w", err)
		}

		// Prepare the response
		userData = map[string]interface{}{
			"role":   role,
			"UserID": nil,
		}

		if userID.Valid {
			userData["UserID"] = userID.Int64
		}
	}

	return userData, nil
}

//USER

// UpdateUserInfo updates user information
func (db *Database) UpdateUserInfo(userID int, userAccount UserAccount) error {
	query := `UPDATE user SET FirstName = ?, LastName = ?, IDCard = ?, DOB = ?, PhoneNo = ?, Address = ?, BankName = ?, BankAccNo = ? 
			  WHERE UserID = ?`
	_, err := db.Exec(query, userAccount.FirstName, userAccount.LastName, userAccount.IDCard, userAccount.DOB, userAccount.PhoneNo,
		userAccount.Address, userAccount.BankName, userAccount.BankAccNo, userID)
	if err != nil {
		return fmt.Errorf("updating user info: %w", err)
	}
	return nil
}

// GetUserInfo retrieves user information by user ID, including username from the account table
func (db *Database) GetUserInfo(userID int) (*UserAccount, error) {
	var userAccount UserAccount

	// Query to get user information, including username from the account table
	query := `
		SELECT u.FirstName, u.LastName, u.IDCard, u.DOB, u.PhoneNo, u.Address, u.CreditScore, 
		       u.BankName, u.BankAccNo, a.Username
		FROM user u
		JOIN account a ON u.AccountID = a.AccountID
		WHERE u.UserID = ?`

	err := db.QueryRow(query, userID).Scan(&userAccount.FirstName, &userAccount.LastName, &userAccount.IDCard, &userAccount.DOB,
		&userAccount.PhoneNo, &userAccount.Address, &userAccount.CreditScore, &userAccount.BankName, &userAccount.BankAccNo, &userAccount.Username,
	)
	if err != nil {
		return nil, fmt.Errorf("querying user info: %w", err)
	}

	return &userAccount, nil
}

// GetUserCreditLevel retrieves the credit level of a user based on their credit score
func (db *Database) GetUserCreditLevel(userID int) (string, error) {
	var creditScore int

	// Query to get the credit score of the user
	query := `SELECT CreditScore FROM user WHERE UserID = ?`
	err := db.QueryRow(query, userID).Scan(&creditScore)
	if err != nil {
		return "", fmt.Errorf("querying credit score: %w", err)
	}

	// Determine the credit level based on the credit score
	var creditLevel string
	fmt.Println("creditLevel: ", creditScore, creditLevel)
	switch {
	case creditScore >= 5:
		creditLevel = "red"
	case creditScore >= 3:
		creditLevel = "yellow"
	default:
		creditLevel = "green"

		fmt.Println("creditLevel: ", creditScore, creditLevel)
		return creditLevel, nil
	}
	return creditLevel, nil
}

func (db *Database) getAllUserInfoForAdmin() ([]UserInfoForAdmin, error) {
	query := `SELECT u.UserID, a.Username FROM user u JOIN account a ON u.AccountID = a.AccountID`
	rows, err := db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("querying users: %w", err)
	}
	defer rows.Close()

	var users []UserInfoForAdmin

	for rows.Next() {
		var userID int
		var username string

		if err := rows.Scan(&userID, &username); err != nil {
			return nil, fmt.Errorf("scanning user row: %w", err)
		}

		totalLoan, err := db.GetUserTotalLoanHistory(userID)
		if err != nil {
			return nil, fmt.Errorf("getting user total loan history: %w", err)
		}

		totalLoanRemain, err := db.GetUserTotalLoan(userID)
		if err != nil {
			return nil, fmt.Errorf("getting user total loan remain: %w", err)
		}

		creditLevel, err := db.GetUserCreditLevel(userID)
		if err != nil {
			return nil, fmt.Errorf("getting user credit level: %w", err)
		}

		// Create UserInfoForAdmin struct with ordered fields
		userInfo := UserInfoForAdmin{
			Username:        username,
			TotalLoan:       totalLoan,
			TotalLoanRemain: totalLoanRemain,
			RiskLevel:       creditLevel,
		}

		users = append(users, userInfo)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	// Sort the users slice by username
	sort.Slice(users, func(i, j int) bool {
		return users[i].Username < users[j].Username
	})

	return users, nil
}

//ADMIN

func (db *Database) CreateAdmin(admin Admin) error {
	// Check if the username already exists
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM account WHERE Username = ?)`
	err := db.QueryRow(query, admin.Username).Scan(&exists)
	if err != nil {
		return fmt.Errorf("checking username existence: %w", err)
	}
	if exists {
		return fmt.Errorf("username %s is already taken", admin.Username)
	}

	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hashing password: %w", err)
	}

	// Insert account into the database
	accountQuery := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
	result, err := db.Exec(accountQuery, admin.Username, hashedPassword)
	if err != nil {
		return fmt.Errorf("inserting account: %w", err)
	}

	// Get the last insert ID
	accountID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("getting last insert ID: %w", err)
	}

	// Insert admin details into the loansharkadmin table
	adminQuery := `INSERT INTO loansharkadmin (AccountID, FirstName, LastName) VALUES (?, ?, ?)`
	_, err = db.Exec(adminQuery, accountID, admin.FirstName, admin.LastName)
	if err != nil {
		return fmt.Errorf("inserting loansharkadmin: %w", err)
	}

	return nil
}

//LOAN

// GetTotalLoan calculates the total loan amount including interest for all pending loans
func (db *Database) GetTotalLoan() (float64, error) {
	query := `SELECT Amount, Duedate FROM loan WHERE Status = 'pending'`
	rows, err := db.Query(query)
	if err != nil {
		return 0, fmt.Errorf("querying loans: %w", err)
	}
	defer rows.Close()

	var totalLoan float64

	for rows.Next() {
		var amount float64
		var dueDateStr string

		if err := rows.Scan(&amount, &dueDateStr); err != nil {
			return 0, fmt.Errorf("scanning loan row: %w", err)
		}

		dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
		if err != nil {
			return 0, fmt.Errorf("parsing due date: %w", err)
		}

		totalAmount, _, _ := calculateLoanDetails(amount, dueDate)
		totalLoan += totalAmount
	}

	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("error iterating rows: %w", err)
	}

	return totalLoan, nil
}

// GetUserTotalLoan calculates the total loan amount for a user including interest with pending status
func (db *Database) GetUserTotalLoan(userID int) (float64, error) {
	query := "SELECT Amount, Duedate FROM loan WHERE UserID = ? AND Status = 'pending'"
	rows, err := db.Query(query, userID)
	if err != nil {
		return 0, fmt.Errorf("querying loans: %w", err)
	}
	defer rows.Close()

	var totalLoan float64

	for rows.Next() {
		var amount float64
		var dueDateStr string

		if err := rows.Scan(&amount, &dueDateStr); err != nil {
			return 0, fmt.Errorf("scanning loan row: %w", err)
		}

		dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
		if err != nil {
			return 0, fmt.Errorf("parsing due date: %w", err)
		}

		totalAmount, _, _ := calculateLoanDetails(amount, dueDate)
		totalLoan += totalAmount
	}

	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("error iterating rows: %w", err)
	}

	return totalLoan, nil
}

// GetUserTotalLoanHistory calculates the total loan amount for a user, including interest, across all loan statuses.
func (db *Database) GetUserTotalLoanHistory(userID int) (float64, error) {
	query := `SELECT Amount, Duedate FROM loan WHERE UserID = ?`
	rows, err := db.Query(query, userID)
	if err != nil {
		return 0, fmt.Errorf("querying loans: %w", err)
	}
	defer rows.Close()

	var totalLoan float64
	var found bool // Track if any loan rows were found

	for rows.Next() {
		found = true // Set found to true if a row is processed
		var amount float64
		var dueDateStr string

		if err := rows.Scan(&amount, &dueDateStr); err != nil {
			return 0, fmt.Errorf("scanning loan row: %w", err)
		}

		dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
		if err != nil {
			return 0, fmt.Errorf("parsing due date: %w", err)
		}

		totalAmount, _, _ := calculateLoanDetails(amount, dueDate)
		totalLoan += totalAmount
	}

	if err := rows.Err(); err != nil {
		return 0, fmt.Errorf("error iterating rows: %w", err)
	}

	if !found {
		return 0, fmt.Errorf("no loans found for user with ID %d", userID)
	}

	return totalLoan, nil
}

func getUserLoans(db *Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		userID, err := strconv.Atoi(userIDStr)
		if err != nil || userID <= 0 {
			http.Error(w, "Invalid user ID", http.StatusBadRequest)
			return
		}

		// Updated query to include LoanID
		query := `SELECT LoanID, Amount, Duedate, Status FROM loan WHERE UserID = ?`
		rows, err := db.Query(query, userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("querying loans: %v", err), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var loans []LoanResponse

		for rows.Next() {
			var loanID int
			var amount float64
			var dueDateStr, status string

			if err := rows.Scan(&loanID, &amount, &dueDateStr, &status); err != nil {
				http.Error(w, fmt.Sprintf("scanning loan row: %v", err), http.StatusInternalServerError)
				return
			}

			dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
			if err != nil {
				http.Error(w, fmt.Sprintf("parsing due date: %v", err), http.StatusInternalServerError)
				return
			}

			totalAmount, interestAmount, interestRate := calculateLoanDetails(amount, dueDate)

			loans = append(loans, LoanResponse{
				LoanID:         loanID, // Include the loan ID in the response
				TotalAmount:    totalAmount,
				DueDateTime:    dueDate.Format("2006-01-02 15:04:05"),
				InitialAmount:  amount,
				InterestRate:   interestRate,
				InterestAmount: interestAmount,
				Status:         status, // Include the loan status in the response
			})
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(loans)
	}
}

func (db *Database) checkLoanDetails(request LoanRequest) (LoanResponse, error) {
	dueDateTime, err := time.Parse("2006-01-02 15:04", request.DueDateTime)
	if err != nil {
		return LoanResponse{}, fmt.Errorf("parsing DueDateTime: %w", err)
	}

	totalAmount, interestAmount, interestRate := calculateLoanDetails(request.InitialAmount, dueDateTime)

	return LoanResponse{
		TotalAmount:    totalAmount,
		DueDateTime:    request.DueDateTime,
		InitialAmount:  request.InitialAmount,
		InterestRate:   interestRate,
		InterestAmount: interestAmount,
		Status:         "pending",
	}, nil
}

func (db *Database) applyForLoan(request LoanRequest) (LoanResponse, error) {
	dueDateTime, err := time.Parse("2006-01-02 15:04", request.DueDateTime)
	if err != nil {
		return LoanResponse{}, fmt.Errorf("parsing DueDateTime: %w", err)
	}

	totalAmount, interestAmount, interestRate := calculateLoanDetails(request.InitialAmount, dueDateTime)

	loc, err := time.LoadLocation("Asia/Bangkok")
	if err != nil {
		return LoanResponse{}, fmt.Errorf("loading location: %w", err)
	}
	doProcess := time.Now().In(loc)
	fmt.Println("doProcess: ", doProcess)

	query := `INSERT INTO loan (UserID, Amount, Duedate, DOProcess, Status) VALUES (?, ?, ?, ?, ?)`
	_, err = db.Exec(query, request.UserID, request.InitialAmount, dueDateTime.Format("2006-01-02 15:04:05"), doProcess.Format("2006-01-02 15:04:05"), "pending")
	if err != nil {
		return LoanResponse{}, fmt.Errorf("inserting loan: %w", err)
	}

	return LoanResponse{
		TotalAmount:    totalAmount,
		DueDateTime:    request.DueDateTime,
		InitialAmount:  request.InitialAmount,
		InterestRate:   interestRate,
		InterestAmount: interestAmount,
		Status:         "pending",
	}, nil
}

// PAYMENT
func confirmPaymentDetails(db *Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: %s %s", r.Method, r.URL.Path)

		// Check if the request method is GET
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Retrieve LoanID from query parameters
		loanIDStr := r.URL.Query().Get("loanID")
		if loanIDStr == "" {
			http.Error(w, "LoanID is required", http.StatusBadRequest)
			return
		}

		// Convert LoanID to integer
		loanID, err := strconv.Atoi(loanIDStr)
		if err != nil {
			http.Error(w, "Invalid LoanID format", http.StatusBadRequest)
			return
		}

		// Query to retrieve loan details
		query := `SELECT Amount, Duedate FROM loan WHERE LoanID = ?`
		var amount float64
		var dueDateStr string
		err = db.QueryRow(query, loanID).Scan(&amount, &dueDateStr)

		// Check for errors in the query
		if err == sql.ErrNoRows {
			http.Error(w, "Loan not found", http.StatusNotFound)
			return
		} else if err != nil {
			log.Printf("Error querying loan: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Parse the due date
		dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
		if err != nil {
			http.Error(w, fmt.Sprintf("Parsing due date: %v", err), http.StatusInternalServerError)
			return
		}

		// Calculate total amount using your helper functions
		totalAmount, _, _ := calculateLoanDetails(amount, dueDate)

		// Prepare the JSON response with only the total amount
		response := map[string]float64{
			"totalAmount": totalAmount,
		}

		// Set response headers and encode the response as JSON
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func makePayment(db *Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request to make payment for LoanID: %s", r.URL.Query().Get("loanID"))

		// Check if the request method is POST
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Retrieve LoanID from query parameters
		loanIDStr := r.URL.Query().Get("loanID")
		if loanIDStr == "" {
			http.Error(w, "LoanID is required", http.StatusBadRequest)
			return
		}

		// Convert LoanID to integer
		loanID, err := strconv.Atoi(loanIDStr)
		if err != nil {
			http.Error(w, "Invalid LoanID format", http.StatusBadRequest)
			return
		}

		// Get current Thai time
		tz, err := time.LoadLocation("Asia/Bangkok")
		if err != nil {
			http.Error(w, "Error loading timezone", http.StatusInternalServerError)
			return
		}
		dopayment := time.Now().In(tz)
		fmt.Println("dopayment: ", dopayment)

		// Query to get the due date and loan status
		var dueDate time.Time
		var loanStatus string
		query := `SELECT Duedate, Status FROM loan WHERE LoanID = ?`
		var dueDateStr string

		db.QueryRow(query, loanID).Scan(&dueDateStr, &loanStatus)
		dueDate, err = time.Parse("2006-01-02 15:04:05", dueDateStr)
		fmt.Println("duedate: ", dueDate)
		if err != nil {
			http.Error(w, fmt.Sprintf("Parsing due date: %v", err), http.StatusInternalServerError)
			return
		}

		// Determine the payment status
		status := "intime"
		if dopayment.Year() > dueDate.Year() ||
			(dopayment.Year() == dueDate.Year() && dopayment.Month() > dueDate.Month()) ||
			(dopayment.Year() == dueDate.Year() && dopayment.Month() == dueDate.Month() && dopayment.Day() > dueDate.Day()) ||
			(dopayment.Year() == dueDate.Year() && dopayment.Month() == dueDate.Month() && dopayment.Day() == dueDate.Day() && dopayment.Hour() > dueDate.Hour()) ||
			(dopayment.Year() == dueDate.Year() && dopayment.Month() == dueDate.Month() && dopayment.Day() == dueDate.Day() && dopayment.Hour() == dueDate.Hour() && dopayment.Minute() > dueDate.Minute()) ||
			(dopayment.Year() == dueDate.Year() && dopayment.Month() == dueDate.Month() && dopayment.Day() == dueDate.Day() && dopayment.Hour() == dueDate.Hour() && dopayment.Minute() == dueDate.Minute() && dopayment.Second() > dueDate.Second()) {
			status = "late"
		}
		//fmt.Println("status", dopayment,dueDate,status)

		// Insert the payment record into the payment table
		_, err = db.Exec(`INSERT INTO payment (LoanID, DOPayment, Status) VALUES (?, ?, ?)`, loanID, dopayment.Format("2006-01-02 15:04:05"), status)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error inserting payment record: %v", err), http.StatusInternalServerError)
			return
		}

		// Update the loan status to "complete"
		_, err = db.Exec(`UPDATE loan SET Status = 'complete' WHERE LoanID = ?`, loanID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating loan status: %v", err), http.StatusInternalServerError)
			return
		}

		// If the payment is late, increment the user's credit score
		if status == "late" {
			var userID int
			err = db.QueryRow(`SELECT UserID FROM loan WHERE LoanID = ?`, loanID).Scan(&userID)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error fetching UserID: %v", err), http.StatusInternalServerError)
				return
			}

			_, err = db.Exec(`UPDATE user SET CreditScore = CreditScore + 1 WHERE UserID = ?`, userID)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error updating user credit score: %v", err), http.StatusInternalServerError)
				return
			}
		}

		// Prepare a success response
		response := map[string]string{
			"message": "Payment processed successfully",
			"status":  status,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}
}

func (db *Database) checkPaymentDetails(loanID int) (map[string]interface{}, error) {
	query := `SELECT LoanID, DOPayment, Status FROM payment WHERE LoanID = ?`
	var loanIDFromDB int
	var doPayment, status string

	err := db.QueryRow(query, loanID).Scan(&loanIDFromDB, &doPayment, &status)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no payment found for LoanID %d", loanID)
		}
		return nil, fmt.Errorf("querying payment details: %w", err)
	}

	response := map[string]interface{}{
		"loanID":    loanIDFromDB,
		"doPayment": doPayment,
		"status":    status,
	}

	return response, nil
}

// Enable CORS
func enableCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow only specific origin (you can change this based on your frontend URL)
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Allow credentials if needed (for cookies or authorization headers)
		// w.Header().Set("Access-Control-Allow-Credentials", "true")

		// Handle preflight requests (OPTIONS)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		// Pass the request to the next handler
		h.ServeHTTP(w, r)
	})
}

// Main function to set up server and routes
func main() {
	// Connect to the database
	db, err := sql.Open("mysql", "root:root@tcp(localhost:8889)/loanloey")
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	database := &Database{db}

	//ACCOUNT

	// HTTP route for user signup
	http.Handle("/signup", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var userAccount UserAccount
		if err := json.NewDecoder(r.Body).Decode(&userAccount); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := database.Signup(userAccount); err != nil {
			http.Error(w, fmt.Sprintf("Signup failed: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "Account and User created successfully!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// HTTP route to delete an account
	http.Handle("/deleteAccount", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodDelete {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		accountIDStr := r.URL.Query().Get("accountID")
		if accountIDStr == "" {
			http.Error(w, "AccountID is required", http.StatusBadRequest)
			return
		}

		accountID, err := strconv.Atoi(accountIDStr)
		if err != nil {
			http.Error(w, "Invalid AccountID format", http.StatusBadRequest)
			return
		}

		if err := database.DeleteAccount(accountID); err != nil {
			http.Error(w, fmt.Sprintf("DeleteAccount failed: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "Account deleted successfully!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// HTTP route for user login
	http.Handle("/login", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var credentials struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		role, err := database.Login(credentials.Username, credentials.Password)
		if err != nil {
			http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(role)
	})))

	// http.HandleFunc("/adminpage", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintln(w, "Welcome to the Admin Page!")
	// })

	// http.HandleFunc("/homepage", func(w http.ResponseWriter, r *http.Request) {
	// 	fmt.Fprintln(w, "Welcome to the Home Page!")
	// })

	//USER

	// HTTP route to update user information
	http.Handle("/updateUserInfo", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var userAccount UserAccount
		if err := json.NewDecoder(r.Body).Decode(&userAccount); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		if err := database.UpdateUserInfo(userID, userAccount); err != nil {
			http.Error(w, fmt.Sprintf("UpdateUserInfo failed: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "User information updated successfully!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// HTTP route to get user information
	http.Handle("/getUserInfo", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		log.Printf("Received UserID: %s", userIDStr)

		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			log.Printf("Error converting UserID: %v", err)
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		userAccount, err := database.GetUserInfo(userID)
		if err != nil {
			log.Printf("Failed to get user info: %v", err)
			http.Error(w, "User not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(userAccount); err != nil {
			log.Printf("Error encoding user info to JSON: %v", err)
			http.Error(w, "Failed to encode response", http.StatusInternalServerError)
			return
		}
	})))

	// HTTP route to get user credit level
	http.Handle("/getUserCreditLevel", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		creditLevel, err := database.GetUserCreditLevel(userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get credit level: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"credit_level": creditLevel}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// HTTP route to get all user information for admin
	http.Handle("/getAllUserInfoForAdmin", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		users, err := database.getAllUserInfoForAdmin()
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get all user info: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	})))

	//ADMIN
	// HTTP route for admin creation
	http.Handle("/createAdmin", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var admin Admin
		if err := json.NewDecoder(r.Body).Decode(&admin); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := database.CreateAdmin(admin); err != nil {
			http.Error(w, fmt.Sprintf("CreateAdmin failed: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "Admin created successfully!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	//LOAN
	// HTTP route to get total loan amount with pending status
	http.Handle("/getTotalLoan", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		totalLoan, err := database.GetTotalLoan()
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get total loan: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]float64{"total_loan": totalLoan}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	http.Handle("/getUserTotalLoan", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		totalLoan, err := database.GetUserTotalLoan(userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get total loan: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]float64{"total_loan": totalLoan}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	http.Handle("/getUserTotalLoanHistory", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		userIDStr := r.URL.Query().Get("userID")
		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		totalLoan, err := database.GetUserTotalLoanHistory(userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get total loan: %v", err), http.StatusInternalServerError)
			return
		}
		response := map[string]float64{"total_loan": totalLoan}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	http.Handle("/getUserLoans", enableCORS(http.HandlerFunc(getUserLoans(database))))

	http.Handle("/checkLoanDetails", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var loanRequest LoanRequest
		if err := json.NewDecoder(r.Body).Decode(&loanRequest); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		response, err := database.checkLoanDetails(loanRequest)
		if err != nil {
			http.Error(w, fmt.Sprintf("Loan info calculation failed: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	// / HTTP route for applying for a loan
	http.Handle("/applyForLoan", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var loanRequest LoanRequest
		if err := json.NewDecoder(r.Body).Decode(&loanRequest); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		response, err := database.applyForLoan(loanRequest)
		if err != nil {
			http.Error(w, fmt.Sprintf("Loan application failed: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	//PAYMENT
	http.Handle("/confirmPaymentDetails", enableCORS(http.HandlerFunc(confirmPaymentDetails(database))))

	// Register your handlers
	http.Handle("/makePayment", enableCORS(http.HandlerFunc(makePayment(database))))

	http.Handle("/checkPaymentDetails", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		loanIDStr := r.URL.Query().Get("loanID")
		if loanIDStr == "" {
			http.Error(w, "LoanID is required", http.StatusBadRequest)
			return
		}

		loanID, err := strconv.Atoi(loanIDStr)
		if err != nil {
			http.Error(w, "Invalid LoanID format", http.StatusBadRequest)
			return
		}

		response, err := database.checkPaymentDetails(loanID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to check payment details: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
