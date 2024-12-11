import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  /
import './styles/otp.css';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '../store/Auth';  
import Showmsg from "./Showmsg"; 

const OTPVerification = () => {
    const { user } = useAuth();  
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']); 
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);  
    const [showmsg, setShowmsg] = useState({ message: "", type: "" }); 

    const navigate = useNavigate();  

    useEffect(() => {
       
        if (user && user.email) {
            setEmail(user.email);  
        } else {
            const savedEmail = localStorage.getItem('email');
            if (savedEmail) {
                setEmail(savedEmail);  
            }
        }
    }, [user]);  

    const handleOtpChange = (e, index) => {
        let otpCopy = [...otp];
        otpCopy[index] = e.target.value.slice(0, 1); 
        setOtp(otpCopy);
        if (e.target.value && index < otp.length - 1) {
            document.getElementById(`otp-input-${index + 1}`).focus();
        }
    };

    const sendOtp = async () => {
        if (!email) {
            setShowmsg({ message: 'Please enter your email.', type: 'error' });  
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/send-otp',
                { email },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.status === 200) {
                setShowmsg({ message: 'OTP sent successfully to your email.', type: 'success' });  
                setOtpSent(true);  
            }
        } catch (error) {
            setShowmsg({ message: 'Error sending OTP. Please try again.', type: 'error' });  
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        const otpValue = otp.join(''); 
        if (!otpValue) {
            setShowmsg({ message: 'Please enter OTP.', type: 'error' }); 
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/auth/verify-otp',
                { email, otp: otpValue },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.status === 200) {
                setShowmsg({ message: 'Account verified successfully!', type: 'success' });  
                navigate('/profile');  
            }
        } catch (error) {
            setShowmsg({ message: 'Error verifying OTP. Please try again.', type: 'error' }); 
        } finally {
            setLoading(false);
        }
    };

    const closeMessage = () => {
        setShowmsg({ message: "", type: "" });
    };

    return (
        <>
            <Navbar />
            <div className="otp-verification">
                <h1>Verify Your Account</h1>
              
                <Showmsg
                    message={showmsg.message}
                    type={showmsg.type}
                    onClose={closeMessage}
                />

                {/* Only show email field if OTP has not been sent */}
                {!otpSent && (
                    <>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly
                        />
                        <button onClick={sendOtp} disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </>
                )}

                {/* OTP field, shown only after OTP is sent */}
                {otpSent && (
                    <>
                        <div className="otp-box-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-input-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(e, index)}
                                    className="otp-box"
                                />
                            ))}
                        </div>
                        <button onClick={verifyOtp} disabled={loading}>
                            {loading ? 'Verifying OTP...' : 'Verify OTP'}
                        </button>
                    </>
                )}
            </div>
            <Footer />
        </>
    );
};

export default OTPVerification;
