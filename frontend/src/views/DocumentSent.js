import React, {useEffect, useState} from "react";
import { useHistory } from "react-router-dom";
import { Form, Button, Container, Row, Col, Card, FormGroup } from "react-bootstrap";
import Heartbeat from "./Heartbeat.js";
import "../assets/scss/lbd/_docsent.scss";

function DocumentSent() {
    return(
        <div className="body-wrapper">
        <Container fluid>
           <Row>
                <Col md="12">
                    <div className="d-flex align-items-center justify-content-center">
                        <img src={require("../assets/img/docsent.png")} alt="docsent-img" style={{width:500}} />
                    </div>
                </Col>
           </Row>
           <Row>
                <Col md="12">
                    <div className="d-flex align-items-center justify-content-center">
                        <h2><strong>Document sent!</strong></h2>
                    </div>
                </Col>
           </Row>
           <Row>
                <Col md="12">
                    <div className="d-flex align-items-center justify-content-center">
                        <h5>Your document is on its way to your recipients</h5>
                    </div>
                </Col>
           </Row>
        </Container>
    </div>
    );
}

export default DocumentSent;