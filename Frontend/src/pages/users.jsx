import React from 'react';
import { useEffect } from 'react';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = React.useState([]);
    useEffect(() => {
        const fetchUsers = async () => {
            try{
                const  res = await axios.get('http://localhost:3000/users');
                setUsers(res.data);
            console.log(res);
            } catch (err) {
                console.log(err);
            }
        }
        fetchUsers();
    }, []);

    return (
        <div>
            <h1>WholeSplit Users</h1>
            <div className="Users">
                {users.map((user) => (
                    <div key={user.UserID}>
                        {user.FName} {user.LName} - {user.Email}
                        <h2>{user.PreferredPaymentMethod}</h2>
                        <h2>{user.PreferredShoppingDay}</h2>
                        <h2>{user.PreferredSplitLocation}</h2>
                        <h2>{user.PostalCode}</h2>
                        
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Users;