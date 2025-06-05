import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move-item";
import { FaTrashAlt } from "react-icons/fa";
import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Spinner, 
  Button,
  Modal
} from "react-bootstrap";

const SortableItem = SortableElement(({ card, index, handleCardEmployeeChange, handleDeleteCard, employeeName, documentCards }) => (
  <Card className="mt-3 mb-0">
    <Card.Body>
      <Row className="mt-2">
        <Col md="4">
          <Form.Group>
            <span className="text-danger">*</span>
            <label>Full Name</label>
            <Form.Select 
              required
              value={card.id_karyawan}
              onChange={(e) => handleCardEmployeeChange(card.id, e.target.value)}
            >
              <option hidden value="">Choose Signer</option>
              {employeeName.map((emp) => {
                const isSelected = documentCards.some(c => c.id_karyawan === emp.value && c.id !== card.id);
                return (
                  <option key={emp.value} value={emp.value} disabled={isSelected}>
                    {emp.label}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md="4">
          <Form.Group>
            <label>Email</label>
            <Form.Control type="email" value={card.email} readOnly />
          </Form.Group>
        </Col>
        <Col md="2" className="d-flex align-items-end mt-sm-3">
          <Button variant="outline-danger" disabled={documentCards.length <= 1} onClick={() => handleDeleteCard(card.id)} ><FaTrashAlt className="mb-1"/> Delete</Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

export default SortableItem;



