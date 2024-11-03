package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

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

// Database struct wraps the SQL database connection
type Database struct {
	*sql.DB
}

// Signup function to create a new account
func (db *Database) Signup(userAccount UserAccount) error {
	// Hash the password if it is provided
	var hashedPassword []byte
	if userAccount.Password != "" {
		var err error
		hashedPassword, err = bcrypt.GenerateFromPassword([]byte(userAccount.Password), bcrypt.DefaultCost)
		if err != nil {
			return fmt.Errorf("hashing password: %w", err)
		}
	}

	// Insert account into the database
	query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
	result, err := db.Exec(query, userAccount.Username, hashedPassword)
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

// GetUserInfoByID retrieves user information by user ID
func (db *Database) GetUserInfoByID(userID int) (*UserAccount, error) {
	var userAccount UserAccount

	// Query to get user information, including bank details
	query := `SELECT u.FirstName, u.LastName, u.IDCard, u.DOB, u.PhoneNo, u.Address, u.CreditScore, 
                      u.BankName, u.BankAccNo 
              FROM user u WHERE u.UserID = ?`
	err := db.QueryRow(query, userID).Scan(&userAccount.FirstName, &userAccount.LastName, &userAccount.IDCard, &userAccount.DOB, 
		&userAccount.PhoneNo, &userAccount.Address, &userAccount.CreditScore, &userAccount.BankName, &userAccount.BankAccNo)
	if err != nil {
		return nil, fmt.Errorf("querying user info: %w", err)
	}

	return &userAccount, nil
}

// CreateAdmin function to create a new admin account
func (db *Database) CreateAdmin(admin Admin) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hashing password: %w", err)
	}

	// Insert admin account into the database
	query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
	result, err := db.Exec(query, admin.Username, hashedPassword)
	if err != nil {
		return fmt.Errorf("inserting account: %w", err)
	}

	// Get the last insert ID
	accountID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("getting last insert ID: %w", err)
	}

	// Insert admin details
	adminQuery := `INSERT INTO admin (AccountID, FirstName, LastName) VALUES (?, ?, ?)`
	_, err = db.Exec(adminQuery, accountID, admin.FirstName, admin.LastName)
	if err != nil {
		return fmt.Errorf("inserting admin: %w", err)
	}

	return nil
}

// Login function for user login
func (db *Database) Login(username, password string) (string, error) {
	var storedHash string
	var accountID int64
	var isAdmin bool

	// Query to get stored password hash and account ID
	query := `SELECT PasswordHash, AccountID FROM account WHERE Username = ?`
	err := db.QueryRow(query, username).Scan(&storedHash, &accountID)
	if err != nil {
		return "", fmt.Errorf("querying for username %s: %w", username, err)
	}

	// Compare the provided password with the stored hash
	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)); err != nil {
		return "", fmt.Errorf("invalid credentials: %w", err)
	}

	// Check if the user is an admin
	adminQuery := `SELECT COUNT(*) FROM admin WHERE AccountID = ?`
	err = db.QueryRow(adminQuery, accountID).Scan(&isAdmin)
	if err != nil {
		return "", fmt.Errorf("checking admin status: %w", err)
	}

	if isAdmin {
		return "admin", nil
	}
	return "user", nil
}

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
// DeleteAccount function to delete an account based on account ID
func (db *Database) DeleteAccount(accountID int) error {
	// Delete from user table if exists
	userQuery := `DELETE FROM user WHERE AccountID = ?`
	_, err := db.Exec(userQuery, accountID)
	if err != nil {
		return fmt.Errorf("deleting from user table: %w", err)
	}

	// Delete from admin table if exists
	adminQuery := `DELETE FROM admin WHERE AccountID = ?`
	_, err = db.Exec(adminQuery, accountID)
	if err != nil {
		return fmt.Errorf("deleting from admin table: %w", err)
	}

	// Finally, delete from account table
	accountQuery := `DELETE FROM account WHERE AccountID = ?`
	_, err = db.Exec(accountQuery, accountID)
	if err != nil {
		return fmt.Errorf("deleting from account table: %w", err)
	}

	return nil
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

	// HTTP route for user signup
	http.HandleFunc("/signup", func(w http.ResponseWriter, r *http.Request) {
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
	})

	// HTTP route for admin creation
	http.HandleFunc("/createAdmin", func(w http.ResponseWriter, r *http.Request) {
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
	})

	// HTTP route to get user information
	http.HandleFunc("/getUserInfo", func(w http.ResponseWriter, r *http.Request) {
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

		userAccount, err := database.GetUserInfoByID(userID)
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
	})

// HTTP route for user login
http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
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

	// Redirect based on the role
	redirectPath := "/homepage"
	if role == "admin" {
		redirectPath = "/adminpage"
	}
	http.Redirect(w, r, redirectPath, http.StatusFound)
})

	http.HandleFunc("/adminpage", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Welcome to the Admin Page!")
	})

	http.HandleFunc("/homepage", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Welcome to the Home Page!")
	})

		// HTTP route to update user information
http.HandleFunc("/updateUserInfo", func(w http.ResponseWriter, r *http.Request) {
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
	})

	// HTTP route to delete an account
http.HandleFunc("/deleteAccount", func(w http.ResponseWriter, r *http.Request) {
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
})


	log.Println("Server starting on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
