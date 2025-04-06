package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"database/sql"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
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
	UserID          int     `json:"user_id"`
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

func (db *Database) DeleteAccount(userID int) error {
	var accountID int // To hold the account ID associated with the given user ID.

	// Retrieve AccountID using the provided UserID.
	err := db.QueryRow(`SELECT AccountID FROM user WHERE UserID = ?`, userID).Scan(&accountID)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("no account found for UserID %d", userID)
		}
		return fmt.Errorf("error retrieving AccountID for UserID %d: %w", userID, err)
	}

	// Check for pending loans.
	var pendingLoans int
	query := `SELECT COUNT(*) FROM loan WHERE UserID = ? AND Status = 'pending'`
	err = db.QueryRow(query, userID).Scan(&pendingLoans)
	if err != nil {
		return fmt.Errorf("checking pending loans: %w", err)
	}

	if pendingLoans > 0 {
		return fmt.Errorf("cannot delete account with pending loans")
	}

	// Delete payments related to the user's loans.
	_, err = db.Exec(`DELETE FROM payment WHERE LoanID IN (SELECT LoanID FROM loan WHERE UserID = ?)`, userID)
	if err != nil {
		return fmt.Errorf("deleting payments: %w", err)
	}

	// Delete loans related to the user.
	_, err = db.Exec(`DELETE FROM loan WHERE UserID = ?`, userID)
	if err != nil {
		return fmt.Errorf("deleting loans: %w", err)
	}

	// Delete the user from the user table.
	_, err = db.Exec(`DELETE FROM user WHERE UserID = ?`, userID)
	if err != nil {
		return fmt.Errorf("deleting user: %w", err)
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

// Updated getAllUserInfoForAdmin function
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
			UserID:          userID,
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

	// If no rows were found, return 0 without an error
	if !found {
		return 0, nil
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
	fmt.Println("Entering /applyForLoan handler")
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


// Helper function to generate the RSA key pair
// GenerateRSAKeys generates an RSA key pair and saves them to files
func GenerateRSAKeys() (*rsa.PrivateKey, *rsa.PublicKey, error) {
    // Generate a private key
    privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
    if err != nil {
        return nil, nil, fmt.Errorf("error generating private key: %w", err)
    }

    // Save the private key to a file
    privateKeyFile, err := os.Create("private_key.pem")
    if err != nil {
        return nil, nil, fmt.Errorf("error creating private key file: %w", err)
    }
    defer privateKeyFile.Close()

    privateKeyPEM := pem.EncodeToMemory(&pem.Block{
        Type:  "RSA PRIVATE KEY",
        Bytes: x509.MarshalPKCS1PrivateKey(privateKey),
    })
    privateKeyFile.Write(privateKeyPEM)

    // Save the public key to a file
    publicKey := &privateKey.PublicKey
    publicKeyFile, err := os.Create("public_key.pem")
    if err != nil {
        return nil, nil, fmt.Errorf("error creating public key file: %w", err)
    }
    defer publicKeyFile.Close()

    publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
    if err != nil {
        return nil, nil, fmt.Errorf("error marshaling public key: %w", err)
    }
	publicKeyPEM := pem.EncodeToMemory(&pem.Block{
        Type:  "PUBLIC KEY",
        Bytes: publicKeyBytes,
    })
    publicKeyFile.Write(publicKeyPEM)

    return privateKey, publicKey, nil
}

func loadPublicKey(filename string) (*rsa.PublicKey, error) {
    // Read the public key file
    keyBytes, err := os.ReadFile(filename)
	if err != nil {
        return nil, fmt.Errorf("failed to read public key file: %w", err)
    }

    // Decode the PEM block
    block, _ := pem.Decode(keyBytes)
    if block == nil || block.Type != "PUBLIC KEY" {
        return nil, fmt.Errorf("failed to decode PEM block containing public key")
    }

    // Parse the public key
    publicKey, err := x509.ParsePKIXPublicKey(block.Bytes)
    if err != nil {
        return nil, fmt.Errorf("failed to parse public key: %w", err)
    }

    // Assert the type to *rsa.PublicKey
    rsaPublicKey, ok := publicKey.(*rsa.PublicKey)
    if !ok {
        return nil, fmt.Errorf("not an RSA public key")
    }

    return rsaPublicKey, nil
}

// Generate a random AES key
func generateAESKey() ([]byte, error) {
    key := make([]byte, 32) // 256-bit AES key
    _, err := rand.Read(key)
    if err != nil {
        return nil, err
    }
    return key, nil
}

// Encrypt data using AES-GCM
func encryptWithAES(data, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonce := make([]byte, gcm.NonceSize())
    _, err = io.ReadFull(rand.Reader, nonce)
    if err != nil {
        return nil, err
    }

    ciphertext := gcm.Seal(nonce, nonce, data, nil)
    return ciphertext, nil
}

// Decrypt data using AES-GCM
func decryptWithAES(ciphertext, key []byte) ([]byte, error) {
    block, err := aes.NewCipher(key)
    if err != nil {
        return nil, err
    }

    gcm, err := cipher.NewGCM(block)
    if err != nil {
        return nil, err
    }

    nonceSize := gcm.NonceSize()
    if len(ciphertext) < nonceSize {
        return nil, errors.New("ciphertext too short")
    }

    nonce, ciphertext := ciphertext[:nonceSize], ciphertext[nonceSize:]
    plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
    if err != nil {
        return nil, err
    }

    return plaintext, nil
}

func decryptReceiptHandler(db *Database, privateKey *rsa.PrivateKey) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Received request to decrypt receipt for LoanID: %s", r.URL.Query().Get("loanID"))

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

        // Query to retrieve the encrypted receipt and AES key from the database
        var encryptedReceipt, encryptedAESKey []byte
        query := `SELECT Receipt, AESKey FROM payment WHERE LoanID = ?`
        err = db.QueryRow(query, loanID).Scan(&encryptedReceipt, &encryptedAESKey)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "No receipt found for the given LoanID", http.StatusNotFound)
                return
            }
            http.Error(w, fmt.Sprintf("Error querying receipt: %v", err), http.StatusInternalServerError)
            return
        }

        // Decrypt the AES key using the private key
        aesKey, err := rsa.DecryptPKCS1v15(rand.Reader, privateKey, encryptedAESKey)
        if err != nil {
            http.Error(w, fmt.Sprintf("Error decrypting AES key: %v", err), http.StatusInternalServerError)
            return
        }

        // Decrypt the receipt using the AES key
        decryptedReceipt, err := decryptWithAES(encryptedReceipt, aesKey)
        if err != nil {
            http.Error(w, fmt.Sprintf("Error decrypting receipt: %v", err), http.StatusInternalServerError)
            return
        }

        // Send the decrypted receipt as a response
        w.Header().Set("Content-Type", "application/octet-stream")
        w.Write(decryptedReceipt)
    }
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

func insertPayment(db *Database, publicKey *rsa.PublicKey) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        log.Printf("Received request to insert payment for LoanID: %s", r.URL.Query().Get("loanID"))

        // Check if the request method is POST
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        // Parse the multipart form to handle file uploads
        err := r.ParseMultipartForm(50 << 20) // Limit file size to 50 MB
        if err != nil {
            http.Error(w, "Error parsing form data", http.StatusBadRequest)
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

        // Retrieve the uploaded file
        file, _, err := r.FormFile("receipt")
        if err != nil {
			log.Printf("Error retrieving the file: %v", err)
            http.Error(w, "Error retrieving the file", http.StatusBadRequest)
            return
        }
        defer file.Close()

        // Read the file content
        fileBytes, err := io.ReadAll(file)
        if err != nil {
			log.Printf("Error reading the file: %v", err)
            http.Error(w, "Error reading the file", http.StatusInternalServerError)
            return
        }

         // Generate a random AES key
		 aesKey, err := generateAESKey()
		 if err != nil {
			 log.Printf("Error generating AES key: %v", err)
			 http.Error(w, "Error generating AES key", http.StatusInternalServerError)
			 return
		 }
 
		 // Encrypt the file content using AES
		 encryptedFile, err := encryptWithAES(fileBytes, aesKey)
		 if err != nil {
			 log.Printf("Error encrypting file with AES: %v", err)
			 http.Error(w, "Error encrypting file", http.StatusInternalServerError)
			 return
		 }
 
		 // Encrypt the AES key using RSA
		 encryptedAESKey, err := rsa.EncryptPKCS1v15(rand.Reader, publicKey, aesKey)
		 if err != nil {
			 log.Printf("Error encrypting AES key with RSA: %v", err)
			 http.Error(w, "Error encrypting AES key", http.StatusInternalServerError)
			 return
		 }

        // Query to retrieve loan due date
        query := `SELECT Duedate FROM loan WHERE LoanID = ?`
        var dueDateStr string
        err = db.QueryRow(query, loanID).Scan(&dueDateStr)
        if err != nil {
            if err == sql.ErrNoRows {
                http.Error(w, "Loan not found", http.StatusNotFound)
                return
            }
            http.Error(w, fmt.Sprintf("Error querying loan due date: %v", err), http.StatusInternalServerError)
            return
        }

        // Parse the due date
        dueDate, err := time.Parse("2006-01-02 15:04:05", dueDateStr)
        if err != nil {
            http.Error(w, fmt.Sprintf("Error parsing due date: %v", err), http.StatusInternalServerError)
            return
        }

        // Get current Thai time
        tz, err := time.LoadLocation("Asia/Bangkok")
        if err != nil {
            http.Error(w, "Error loading timezone", http.StatusInternalServerError)
            return
        }
        dopayment := time.Now().In(tz)

        // Determine payment status
        status := "intime"
        if dopayment.After(dueDate) {
            status = "late"
        }

        // Insert the payment record into the payment table, including the encrypted file and AES key
        _, err = db.Exec(`INSERT INTO payment (LoanID, DOPayment, Status, CheckedStatus, Receipt, AESKey) VALUES (?, ?, ?, ?, ?, ?)`,
            loanID, dopayment.Format("2006-01-02 15:04:05"), status, "waiting", encryptedFile, encryptedAESKey)
        if err != nil {
            log.Printf("Error inserting payment record: %v", err)
            http.Error(w, fmt.Sprintf("Error inserting payment record: %v", err), http.StatusInternalServerError)
            return
        }

        // Prepare a success response
        response := map[string]string{
            "message": "Payment inserted and receipt encrypted successfully",
        }

        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    }
}

func handlePaymentApproval(db *Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request to approve/reject payment for LoanID: %s", r.URL.Query().Get("loanID"))

		// Check if the request method is POST
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		// Retrieve LoanID and the action (accept/reject) from the query parameters
		loanIDStr := r.URL.Query().Get("loanID")
		action := r.URL.Query().Get("action")
		if loanIDStr == "" || action == "" {
			http.Error(w, "LoanID and action are required", http.StatusBadRequest)
			return
		}

		// Convert LoanID to integer
		loanID, err := strconv.Atoi(loanIDStr)
		if err != nil {
			http.Error(w, "Invalid LoanID format", http.StatusBadRequest)
			return
		}

		// Check if action is valid (accept/reject)
		if action != "accept" && action != "reject" {
			http.Error(w, "Invalid action, must be either 'accept' or 'reject'", http.StatusBadRequest)
			return
		}

		// Update the checked status based on the action
		checkedStatus := "rejected"
		if action == "accept" {
			checkedStatus = "accepted"
		}

		// Update payment checked status
		_, err = db.Exec(`UPDATE payment SET CheckedStatus = ? WHERE LoanID = ?`, checkedStatus, loanID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error updating payment checked status: %v", err), http.StatusInternalServerError)
			return
		}

		// If the payment is accepted, update the loan status to complete
		if action == "accept" {
			_, err = db.Exec(`UPDATE loan SET Status = 'complete' WHERE LoanID = ?`, loanID)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error updating loan status to complete: %v", err), http.StatusInternalServerError)
				return
			}
		}

		// Prepare a success response
		response := map[string]string{
			"message": fmt.Sprintf("Payment %s and loan status updated", action),
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

func CheckAdminPassword(db *Database, password string) (bool, error) {
	var storedHash string

	// Query to get the stored password hash from the adminpassword table
	query := `SELECT PasswordHash FROM adminpassword LIMIT 1`
	err := db.QueryRow(query).Scan(&storedHash)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, fmt.Errorf("no admin password found")
		}
		return false, fmt.Errorf("querying admin password: %w", err)
	}
	// Print both hashes for debugging

	fmt.Printf("Stored Hash: %s\n", storedHash)
	fmt.Printf("Provided Hash: %s\n", password)

	// Compare the hashed provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)); err != nil {
		return false, nil // Password does not match
	}

	return true, nil // Password matches
}

func getPaymentStatus(db *Database) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Enable CORS if needed
		w.Header().Set("Content-Type", "application/json")

		// Parse loanID from query parameters
		loanIDStr := r.URL.Query().Get("loanID")
		if loanIDStr == "" {
			http.Error(w, "loanID is required", http.StatusBadRequest)
			return
		}

		loanID, err := strconv.Atoi(loanIDStr)
		if err != nil {
			http.Error(w, "Invalid loanID format", http.StatusBadRequest)
			return
		}

		// Query for the latest payment for that loan
		query := `
			SELECT PaymentID, CheckedStatus
			FROM payment
			WHERE LoanID = ?
			ORDER BY PaymentID DESC
			LIMIT 1
		`

		var paymentID int
		var checkedStatus string

		err = db.QueryRow(query, loanID).Scan(&paymentID, &checkedStatus)
		if err != nil {
			if err == sql.ErrNoRows {
				// Return null if no payment is found
				response := map[string]interface{}{
					"PaymentID":     nil,
					"CheckedStatus": nil,
				}
				json.NewEncoder(w).Encode(response)
				return
			}
			http.Error(w, "Database error: "+err.Error(), http.StatusInternalServerError)
			return
		}

		// Prepare and send the response
		response := map[string]interface{}{
			"PaymentID":     paymentID,
			"CheckedStatus": checkedStatus,
		}

		json.NewEncoder(w).Encode(response)
	}
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
	// Generate RSA keys
	privateKey, publicKey, err := GenerateRSAKeys()
    if err != nil {
        log.Fatalf("Failed to generate RSA keys: %v", err)
    }

	// Load the RSA public key from file
	publicKey, err = loadPublicKey("public_key.pem")
    if err != nil {
        log.Fatalf("Failed to load RSA public key: %v", err)
    }

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

		// Parse userID from query parameters
		userIDStr := r.URL.Query().Get("userID")
		if userIDStr == "" {
			http.Error(w, "UserID is required", http.StatusBadRequest)
			return
		}

		// Convert userID to integer
		userID, err := strconv.Atoi(userIDStr)
		if err != nil {
			http.Error(w, "Invalid UserID format", http.StatusBadRequest)
			return
		}

		// Call DeleteAccount with userID
		if err := database.DeleteAccount(userID); err != nil {
			http.Error(w, fmt.Sprintf("DeleteAccount failed: %v", err), http.StatusInternalServerError)
			return
		}

		// Respond with success message
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
		// Return users data with UserID
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
	http.Handle("/insertPayment", enableCORS(http.HandlerFunc(insertPayment(database, publicKey))))
	http.Handle("/decryptReceipt", enableCORS(http.HandlerFunc(decryptReceiptHandler(database, privateKey))))
	http.Handle("/handlePaymentApproval", enableCORS(http.HandlerFunc(handlePaymentApproval(database))))

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
	http.Handle("/checkAdminPassword", enableCORS(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
			return
		}

		var request struct {
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		isValid, err := CheckAdminPassword(database, request.Password)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to check admin password: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]bool{"is_valid": isValid}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})))

	http.Handle("/getPaymentStatus", enableCORS(http.HandlerFunc(getPaymentStatus(database))))

	// Start the server

	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
