// The following resources were used to create this file and in general the whole of the frontend:

// Ramesh Fadatare (Java Guides). (n.d.). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React library
import React from 'react';

// useEffect is used to run code when component loads (fetch data on mount)
import { useEffect } from 'react';

// Axios is used to send HTTP requests to backend API
import axios from 'axios';

const Users = () => {

    // State to store list of users fetched from backend
    const [users, setUsers] = React.useState([]);

    /**
     * useEffect runs once when component mounts
     * It fetches all users from backend API
     */
    useEffect(() => {

        // Async function to fetch user data
        const fetchUsers = async () => {
            try {
                // GET request to backend /users route
                const res = await axios.get('http://localhost:3000/users');

                // Store response data in state
                setUsers(res.data);

                // Debug log to inspect API response in console
                console.log(res);
            } 
            catch (err) {
                // Error handling for failed API request
                console.log(err);
            }
        };

        // Call async function
        fetchUsers();

    }, []);

    return (
        <div>

            {/* Page title */}
            <h1>WholeSplit Users</h1>

            {/* Users container */}
            <div className="Users">

                {/* Loop through users and render each one */}
                {users.map((user) => (
                    <div key={user.UserID}>

                        {/* Basic user identity info */}
                        {user.FName} {user.LName} - {user.Email}

                        {/* User preference details */}
                        <h2>{user.PreferredPaymentMethod}</h2>
                        <h2>{user.PreferredShoppingDay}</h2>
                        <h2>{user.PreferredSplitLocation}</h2>
                        <h2>{user.PostalCode}</h2>

                    </div>
                ))}

            </div>
        </div>
    );
};

// Export component so it can be used in routing
export default Users;