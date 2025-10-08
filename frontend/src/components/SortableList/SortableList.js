import { SortableContainer, SortableElement } from "react-sortable-hoc";
import { FaPen, FaTrashAlt } from "react-icons/fa";

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

const SortableItem = SortableElement(({ handleEditCard, card, index, handleCardEmployeeChange, handleDeleteCard, handleDeleteStepper2, employeeName, documentCards, sign_permission, handlePermissionChange }) => (
  <Card className="mt-3 mb-0">
    <Card.Body>
      <Row className="mt-2">
        <Col md="3">
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
        <Col md="3">
          <Form.Group>
            <label>Email</label>
            <Form.Control type="email" value={card.email} readOnly />
          </Form.Group>
        </Col>
        <Col md="2">
        <label>Sign Permission</label>
          <Form.Select
            value={card.sign_permission || "Needs to sign"}
            onChange={(e) => handlePermissionChange(card.id, e.target.value)}
          >
          {[ 
            {label: "Needs to sign", value: "Needs to sign"}, 
            {label: "Receive a copy", value: "Receive a copy"}
          ].map((option, idx) => (
            <option key={idx} value={option.value}>
              {option.label}
            </option>
          ))}

          </Form.Select>
        </Col>
        <Col md="2" className="d-flex align-items-center justify-content-center mt-sm-3">
          <Button variant="outline-danger" disabled={documentCards.length <= 1} onClick={() => handleDeleteCard(card.id)} ><FaTrashAlt className="mb-1"/> Delete</Button>
        </Col>
        <Col md="2" className="d-flex align-items-center justify-content-center mt-sm-3">
          <Button variant="outline-warning" onClick={() => handleEditCard(card.id)} ><FaPen className="mb-1"/> Update</Button>
        </Col>
      </Row>
    </Card.Body>
  </Card>
));

export default SortableItem;



