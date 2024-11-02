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

// Account struct represents the account information
type Account struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	IDCard    string `json:"id_card"`
	DOB       string `json:"dob"`
	PhoneNo   string `json:"phone_no"`
	Address   string `json:"address"`
}

// Admin struct represents admin information
type Admin struct {
	Username  string `json:"username"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// UserInfo struct represents user details
type UserInfo struct {
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	IDCard      string `json:"id_card"`
	DOB         string `json:"dob"`
	PhoneNo     string `json:"phone_no"`
	Address     string `json:"address"`
	CreditScore int    `json:"credit_score"`
}

// Database struct wraps the SQL database connection
type Database struct {
	*sql.DB
}

// Signup function to create a new account
func (db *Database) Signup(account Account) error {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hashing password: %w", err)
	}

	// Insert account into the database
	query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
	result, err := db.Exec(query, account.Username, hashedPassword)
	if err != nil {
		return fmt.Errorf("inserting account: %w", err)
	}

	// Get the last insert ID
	accountID, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("getting last insert ID: %w", err)
	}

	// Insert user details into the user table
	userQuery := `INSERT INTO user (AccountID, FirstName, LastName, IDCard, DOB, PhoneNo, Address, CreditScore) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
	_, err = db.Exec(userQuery, accountID, account.FirstName, account.LastName, account.IDCard, account.DOB, account.PhoneNo, account.Address)
	if err != nil {
		return fmt.Errorf("inserting user: %w", err)
	}

	return nil
}

// GetUserInfoByID retrieves user information by user ID
func (db *Database) GetUserInfoByID(userID int) (*UserInfo, error) {
	var userInfo UserInfo

	// Query to get user information
	query := `SELECT u.FirstName, u.LastName, u.IDCard, u.DOB, u.PhoneNo, u.Address, u.CreditScore 
              FROM user u WHERE u.UserID = ?`
	err := db.QueryRow(query, userID).Scan(&userInfo.FirstName, &userInfo.LastName, &userInfo.IDCard, &userInfo.DOB, &userInfo.PhoneNo, &userInfo.Address, &userInfo.CreditScore)
	if err != nil {
		return nil, fmt.Errorf("querying user info: %w", err)
	}

	return &userInfo, nil
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

		var account Account
		if err := json.NewDecoder(r.Body).Decode(&account); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if err := database.Signup(account); err != nil {
			http.Error(w, fmt.Sprintf("Signup failed: %v", err), http.StatusInternalServerError)
			return
		}

		response := map[string]string{"message": "Account and User created successfully!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Test JSON body for /signup
	// {
	//   "username": "john_doe",
	//   "password": "password123",
	//   "first_name": "John",
	//   "last_name": "Doe",
	//   "id_card": "123456789",
	//   "dob": "1990-01-01",
	//   "phone_no": "1234567890",
	//   "address": "123 Main St, Anytown, USA"
	// }

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

	// Test JSON body for /createAdmin
	// {
	//   "username": "admin_user",
	//   "password": "adminpass123",
	//   "first_name": "Admin",
	//   "last_name": "User"
	// }

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

		userInfo, err := database.GetUserInfoByID(userID)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to get user info: %v", err), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(userInfo)
	})

	// Test URL for /getUserInfo
	// GET /getUserInfo?userID=1

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

		response := map[string]string{"role": role}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Test JSON body for /login
	// {
	//   "username": "john_doe",
	//   "password": "password123"
	// }

	// Start the server
	log.Println("Server started at :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
