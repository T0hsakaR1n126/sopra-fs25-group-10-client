import React from 'react';
import Authenticator from '@/auth/authenticator';

const LogoutPage: React.FC = () => {
    return (
        <Authenticator>
            <div>
                <h1>Logged out!</h1>
                <p>Please sign in to access more features.</p>
            </div>
        </Authenticator>
    );
};

export default LogoutPage;