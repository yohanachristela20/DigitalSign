import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom"; 
import { Form, Button, Container, Row, Col, Card, FormGroup } from "react-bootstrap";
import "../assets/scss/lbd/_login.scss";
import axios from "axios";
import Heartbeat from "./Heartbeat.js";
import {FaUser, FaKey, FaBriefcase} from 'react-icons/fa'; 


function Login({index}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const history = useHistory();
  const [redirecting, setRedirecting] = useState(false); 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email || !password || !role) {
      alert("Please fill in those fields!");
      return;
    }
  
    try {
      const response = await axios.post('http://10.70.10.20:5000/user-login', {
          email: email,
          password: password,
          role: role,
          user_active: true,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token); 
        localStorage.setItem('role', response.data.role);
        localStorage.setItem('email', response.data.email); 
        localStorage.setItem('user_active', response.data.user_active);
  
        alert(`Welcome ${email}!`);

        const lastRoute = localStorage.getItem("lastRoute");

        if (lastRoute) {
          setRedirecting(true);
          localStorage.removeItem("lastRoute"); 
          history.replace(lastRoute); 
        } else {
          navigateToRolePage(role);
        }
        } else {
          alert("Login error. Please check your credential.");
        }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.message || "Login error. Please try again.");
    }
  };


  const navigateToRolePage = (role) => {
    if (role === "Admin") {
      history.push("/admin/all-document"); 
      <Heartbeat/>
    }
    else if (role === "Super Admin") {
      history.push("/super-admin/employee-management"); 
      <Heartbeat/>
    }
     else {
      history.push("/login"); 
    }
  }

  useEffect(() => {
    if (redirecting) {
      setRedirecting(false);
    }
  }, [redirecting]);

  return (
    <div className="sign-in__wrapper body-bg">
      <Container fluid className="d-flex align-items-center justify-content-center">
        <Row className="login-row element">
          <Card className="login-card shadow mb-0">
            <div className="d-flex justify-content-center">
              <img src={require("assets/img/login2.png")} alt="login-img" className="login-illustration" />
            </div>
            <Card.Body> 
              <h4 className="text-center font-form mt-3 mb-0">Campina Sign</h4>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-2" controlId="email">
                <span class="input-group-text bg-transparent border-0" id="basic-addon1">
                <FaUser style={{ marginRight: '8px' }} />
                <Form.Control
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
                  />
                </span>
                </Form.Group>
                <Form.Group className="mb-2" controlId="password">
                <span class="input-group-text bg-transparent  border-0" id="basic-addon1">
                <FaKey style={{ marginRight: '8px' }} />
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
                  />
                  </span>
                </Form.Group>
                <Form.Group className="mb-2" controlId="role">
                <span class="input-group-text bg-transparent  border-0" id="basic-addon1">
                <FaBriefcase style={{ marginRight: '8px' }} />
                  <Form.Select
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
                  >
                    <option value="" hidden>
                      Role
                    </option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </Form.Select>
                  </span>
                </Form.Group>

                <Button
                  // variant="primary"
                  type="submit"
                  className="w-100 mt-2"
                  style={{ backgroundColor: "#4c4ef9", border: "none", color: "white", marginBottom:'15px'}}
                >
                  Sign In
                </Button>
                <p className="text-center font-footer" style={{fontSize:15}}>Forget Password? Please contact Super Admin.</p>
              </Form>
            </Card.Body>
          </Card>
        </Row>
      </Container>
    </div>
    
  );
}

export default Login;
