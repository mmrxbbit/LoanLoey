package main

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "log"
    "net/http"

    _ "github.com/go-sql-driver/mysql"
    "golang.org/x/crypto/bcrypt"
)

// Account represents an account in the database
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

// Admin represents an admin in the database
type Admin struct {
    Username  string `json:"username"`
    Password  string `json:"password"`
    FirstName string `json:"first_name"`
    LastName  string `json:"last_name"`
}

// CreateUser inserts a new user into the database
func CreateUser(db *sql.DB, account Account) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(account.Password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("CreateUser: %v", err)
    }

    query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
    result, err := db.Exec(query, account.Username, hashedPassword)
    if err != nil {
        return fmt.Errorf("CreateUser: %v", err)
    }

    accountID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("CreateUser: %v", err)
    }

    userQuery := `INSERT INTO user (AccountID, FirstName, LastName, IDCard, DOB, PhoneNo, Address, CreditScore) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 0)`
    _, err = db.Exec(userQuery, accountID, account.FirstName, account.LastName, account.IDCard, account.DOB, account.PhoneNo, account.Address)
    if err != nil {
        return fmt.Errorf("CreateUser: %v", err)
    }

    return nil
}

// CreateAdmin inserts a new admin into the database
func CreateAdmin(db *sql.DB, admin Admin) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(admin.Password), bcrypt.DefaultCost)
    if err != nil {
        return fmt.Errorf("CreateAdmin: %v", err)
    }

    query := `INSERT INTO account (Username, PasswordHash) VALUES (?, ?)`
    result, err := db.Exec(query, admin.Username, hashedPassword)
    if err != nil {
        return fmt.Errorf("CreateAdmin: %v", err)
    }

    accountID, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("CreateAdmin: %v", err)
    }

    adminQuery := `INSERT INTO admin (AccountID, FirstName, LastName) VALUES (?, ?, ?)`
    _, err = db.Exec(adminQuery, accountID, admin.FirstName, admin.LastName)
    if err != nil {
        return fmt.Errorf("CreateAdmin: %v", err)
    }

    return nil
}

// Login handles user login and redirects based on role
func Login(db *sql.DB, username, password string) (string, error) {
    var storedHash string
    var accountID int64
    var isAdmin bool

    query := `SELECT PasswordHash, AccountID FROM account WHERE Username = ?`
    err := db.QueryRow(query, username).Scan(&storedHash, &accountID)
    if err != nil {
        log.Printf("Error querying database for username %s: %v", username, err)
        return "", fmt.Errorf("Login: %v", err)
    }

    if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(password)); err != nil {
        log.Println("Login: Invalid credentials")
        return "", fmt.Errorf("Login: invalid credentials")
    }

    adminQuery := `SELECT COUNT(*) FROM admin WHERE AccountID = ?`
    err = db.QueryRow(adminQuery, accountID).Scan(&isAdmin)
    if err != nil {
        log.Printf("Error checking admin status: %v", err)
        return "", fmt.Errorf("Login: %v", err)
    }

    if isAdmin {
        return "admin", nil
    }
    return "user", nil
}

func main() {
    db, err := sql.Open("mysql", "root:root@tcp(localhost:8889)/loanloey")
    if err != nil {
        log.Fatalf("Failed to connect to database: %v", err)
    }
    defer db.Close()

    // Create User Handler
    http.HandleFunc("/createUser", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var account Account
        err := json.NewDecoder(r.Body).Decode(&account)
        if err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        err = CreateUser(db, account)
        if err != nil {
            http.Error(w, fmt.Sprintf("CreateUser failed: %v", err), http.StatusInternalServerError)
            return
        }

        response := map[string]string{"message": "Account and User created successfully!"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    })

    // Create Admin Handler
    http.HandleFunc("/createAdmin", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var admin Admin
        err := json.NewDecoder(r.Body).Decode(&admin)
        if err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        err = CreateAdmin(db, admin)
        if err != nil {
            http.Error(w, fmt.Sprintf("CreateAdmin failed: %v", err), http.StatusInternalServerError)
            return
        }

        response := map[string]string{"message": "Admin created successfully!"}
        w.Header().Set("Content-Type", "application/json")
        json.NewEncoder(w).Encode(response)
    })

    // Login Handler
    http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        if r.Method != http.MethodPost {
            http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
            return
        }

        var credentials struct {
            Username string `json:"username"`
            Password string `json:"password"`
        }
        
        err := json.NewDecoder(r.Body).Decode(&credentials)
        if err != nil {
            http.Error(w, "Invalid request body", http.StatusBadRequest)
            return
        }

        log.Printf("Login attempt for user: %s", credentials.Username)

        role, err := Login(db, credentials.Username, credentials.Password)
        if err != nil {
            http.Error(w, fmt.Sprintf("Login failed: %v", err), http.StatusUnauthorized)
            return
        }

        // Redirect based on the role
        if role == "admin" {
            http.Redirect(w, r, "/adminpage", http.StatusFound)
        } else {
            http.Redirect(w, r, "/homepage", http.StatusFound)
        }
    })

    // Admin Page Handler
    http.HandleFunc("/adminpage", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Welcome to the Admin Page!")
    })

    // Home Page Handler
    http.HandleFunc("/homepage", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintln(w, "Welcome to the Home Page!")
    })

    log.Println("Starting server on :8080...")
    if err := http.ListenAndServe(":8080", nil); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
