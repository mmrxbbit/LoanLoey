# Loan Management System API

This API allows users to manage their loan applications, account information, and administrative functions. Below is the documentation for the various endpoints, including the expected request bodies and responses.

## API Endpoints

### 1. User Signup
- **URL**: `http://localhost:8080/signup`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "john_doe",
        "password": "securepassword",
        "first_name": "John",
        "last_name": "Doe",
        "id_card": "1234567890123",
        "dob": "1990-01-01",
        "phone_no": "0123456789",
        "address": "123 Main St, Anytown, USA",
        "bank_name": "Bank of Example",
        "bank_acc_no": "9876543210"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Account and User created successfully!"
    }
    ```

### 2. Create Admin
- **URL**: `http://localhost:8080/createAdmin`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "admin_user",
        "password": "adminpassword",
        "first_name": "Admin",
        "last_name": "User"
    }
    ```
- **Response**:
    ```json
    {
        "message": "Admin created successfully!"
    }
    ```

### 3. User Login
- **URL**: `http://localhost:8080/login`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "username": "john_doe",
        "password": "securepassword"
    }
    ```
- **Response**: Redirects to either `/homepage` or `/adminpage`.

### 4. Get User Info
- **URL**: `http://localhost:8080/getUserInfo?userID=3`
- **Method**: `GET`
- **Response**:
    ```json
    {
        "first_name": "John",
        "last_name": "Doe",
        "id_card": "1234567890123",
        "dob": "1990-01-01",
        "phone_no": "0123456789",
        "address": "123 Main St, Anytown, USA",
        "credit_score": 0,
        "bank_name": "Bank of Example",
        "bank_acc_no": "9876543210"
    }
    ```

### 5. Update User Info
- **URL**: `http://localhost:8080/updateUserInfo?userID=3`
- **Method**: `PUT`
- **Request Body**:
    ```json
    {
        "first_name": "Johnathan",
        "last_name": "Doe",
        "id_card": "1234567890123",
        "dob": "1990-01-01",
        "phone_no": "0987654321",
        "address": "456 Elm St, Othertown, USA",
        "bank_name": "New Bank",
        "bank_acc_no": "0123456789"
    }
    ```
- **Response**:
    ```json
    {
        "message": "User information updated successfully!"
    }
    ```

### 6. Delete Account
- **URL**: `http://localhost:8080/deleteAccount?accountID=8`
- **Method**: `DELETE`
- **Response**:
    ```json
    {
        "message": "Account deleted successfully!"
    }
    ```

### 7. Apply for a Loan
- **URL**: `http://localhost:8080/applyForLoan`
- **Method**: `POST`
- **Request Body**:
    ```json
    {
        "user_id": 1,
        "initial_amount": 10000,
        "due_date_time": "2022-01-01 15:00"
    }
    ```
- **Response**:
    ```json
    {
        "total": 10500,
        "due_date_time": "2022-01-01 15:00",
        "initial_amount": 10000,
        "interest_rate": 0.05,
        "interest": 500,
        "status": "pending"

    }
    ```

### 8. Get User Loans
- **URL**: `http://localhost:8080/getUserLoans?userID=3`
- **Method**: `GET`
- **Response**:
    ```json

    {
        "total": 4160,
        "due_date_time": "2030-11-18 12:30:00",
        "initial_amount": 4000,
        "interest_rate": 0.04,
        "interest": 160,
        "status": "pending"
    },
    {
        "total": 42400,
        "due_date_time": "2030-11-18 12:30:00",
        "initial_amount": 40000,
        "interest_rate": 0.06,
        "interest": 2400,
        "status": "pending"
    },
    {
        "total": 42400,
        "due_date_time": "2030-11-18 12:30:00",
        "initial_amount": 40000,
        "interest_rate": 0.06,
        "interest": 2400,
        "status": "pending"
    },
    '''
### 8.Get User Total Loan

- **URL**: `http://localhost:8080/getUserTotalLoan?userID=3`
- **Method**: `GET`
- **Query Parameters**:
    - `userID` (required): User ID to retrieve the total loan amount.

- **Response**:
    ```json
    {
        "total_loan": 303768
    }
    ```
    ```
### 9. Get Total Loan

- **URL**: `http://localhost:8080/getTotalLoan`
- **Method**: `GET`
- **Response**:
    ```json
    {
       "total_loan": 500000
    }
    ```


    ### 10. Create Admin
    - **URL**: `http://localhost:8080/createAdmin`
    - **Method**: `POST`
    - **Request Body**:
        ```json
        {
            "username": "admin_user",
            "password": "adminpassword",
            "first_name": "Admin",
            "last_name": "User"
        }
        ```
    - **Response**:
        ```json
        {
            "message": "Admin created successfully!"
        }
        ```

    ### 11. Check Loan Details
   
    - **URL**: `http://localhost:8080/checkLoanDetails`
    - **Method**: `GET`
    - **Request Body**:
        ```json
        {
            "user_id": 10,
            "initial_amount": 4000,
            "due_date_time": "2030-11-18 12:30"
        }
        ```
    - **Response**:
        ```json
        {
            "total": 4160,
            "due_date_time": "2030-11-18 12:30",
            "initial_amount": 4000,
            "interest_rate": 0.04,
            "interest": 160
            "status": "pending"
          
        }
        ```
    ### 12. Check Payment Details

    - **URL**: `http://localhost:8080/checkPaymentDetails?loanID=52`
    - **Method**: `GET`
    - **Response**:
        ```json
        {
            "totalAmount": 4160
        }
        ```
    ### 13. Make Payment

    - **URL**: `http://localhost:8080/makePayment?loanID=76`
    - **Method**: `POST`
    - **Response**:
        ```json
        {
            "message": "Payment processed successfully",
            "status": "intime"
        }
        ```


### 14. Get User Credit Level

- **URL**: `http://localhost:8080/getUserCreditLevel?userID=10`
- **Method**: `GET`
- **Response**:
    ```json
    {
        "credit_level": "yellow"
    }
    ```

    ### 15. Get User Loan History

    - **URL**: `http://localhost:8080/getUserTotalLoanHistory?userID=10`
    - **Method**: `GET`
    - **Response**:
        ```json
        {
            "total_loan": 1229760
        }
        ```

    ### 16. Get All User Info for Admin

    - **URL**: `http://localhost:8080/getAllUserInfoForAdmin`
    - **Method**: `GET`
    - **Response**:
        ```json
        [
            {
                "username": "john_doe2",
                "total_loan": 1355760,
                "total_loan_remain": 892960,
                "risk_level": "red"
            },
            {
                "username": "john_doe2",
                "total_loan": 0,
                "total_loan_remain": 0,
                "risk_level": "green"
            },
            {
                "username": "test",
                "total_loan": 84000,
                "total_loan_remain": 84000,
                "risk_level": "green"
            },
            {
                "username": "test",
                "total_loan": 0,
                "total_loan_remain": 0,
                "risk_level": "green"
            }
        ]
### 17. Check Payment Details

- **URL**: `http://localhost:8080/checkPaymentDetails?loanID=72`
- **Method**: `GET`
- **Response**:
    ```json
    {
        "doPayment": "2024-11-04 01:32:18",
        "loanID": 72,
        "status": "intime"
    }
    ```
```