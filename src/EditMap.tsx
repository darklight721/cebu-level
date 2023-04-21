import { useState } from 'react'
import {
  Button,
  CloseButton,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap'
import { DEFAULT_COLOR, VALUES, type Values } from './data'

type Level = Values['levels'][0]

type Props = {
  values: Values
  onSave: (newValues: Values) => void
  onReset: () => void
}

function EditMapModal({
  values,
  onSave,
  onReset,
  toggle,
}: Props & { toggle: () => void }) {
  const [name, setName] = useState(values.name)
  const [showPoints, setShowPoints] = useState(values.showPoints)
  const [levels, setLevels] = useState(values.levels)

  const changeLevelValue = (index: number, key: keyof Level, value: string) =>
    setLevels((p) =>
      p.map((l, i) => (i === index ? { ...l, [key]: value } : l))
    )

  return (
    <Modal isOpen toggle={toggle}>
      <ModalHeader toggle={toggle}>Edit Map</ModalHeader>
      <ModalBody>
        <Form
          id="form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            e.currentTarget.classList.add('was-validated')

            if (e.currentTarget.checkValidity()) {
              onSave({
                name,
                showPoints,
                levels: levels.map((l) => ({ ...l, points: Number(l.points) })),
              })
              toggle()
            }
          }}
        >
          <FormGroup>
            <Label for="name">Name</Label>
            <Input
              id="name"
              maxLength={48}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormGroup>
          <FormGroup check className="mb-3">
            <Input
              id="show_points"
              type="checkbox"
              checked={showPoints}
              onChange={() => setShowPoints((p) => !p)}
            />
            <Label for="show_points" check>
              Show points?
            </Label>
          </FormGroup>
          <Label>Levels</Label>
          {levels.map((level, index) => (
            <Row key={index}>
              <Col xs="2">
                <FormGroup>
                  <Input
                    required
                    className="color-input"
                    type="color"
                    value={level.color}
                    onChange={(e) =>
                      changeLevelValue(index, 'color', e.target.value)
                    }
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Input
                    required
                    placeholder="Level name"
                    maxLength={32}
                    value={level.name}
                    onChange={(e) =>
                      changeLevelValue(index, 'name', e.target.value)
                    }
                  />
                </FormGroup>
              </Col>
              {showPoints && (
                <Col xs="3">
                  <FormGroup>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      placeholder="Points"
                      value={level.points}
                      onChange={(e) =>
                        changeLevelValue(index, 'points', e.target.value)
                      }
                    />
                  </FormGroup>
                </Col>
              )}
              <Col xs="auto">
                <CloseButton
                  className="p-2"
                  disabled={levels.length <= 1}
                  onClick={() => setLevels((p) => p.filter((l) => l !== level))}
                />
              </Col>
            </Row>
          ))}
          <Button
            outline
            type="button"
            color="primary"
            disabled={levels.length >= 10}
            onClick={() =>
              setLevels((p) => [
                ...p,
                { color: DEFAULT_COLOR, name: '', points: 0 },
              ])
            }
          >
            Add new level
          </Button>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="primary" type="submit" form="form">
          Save
        </Button>
        <Button
          color="danger"
          onClick={() => {
            onSave({ ...VALUES })
            onReset()
            toggle()
          }}
        >
          Reset
        </Button>
        <Button outline onClick={toggle}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default function EditMap(props: Props) {
  const [isEditing, setEditing] = useState(false)

  return (
    <>
      <Button onClick={() => setEditing(true)}>Edit Map</Button>
      {isEditing && (
        <EditMapModal {...props} toggle={() => setEditing(false)} />
      )}
    </>
  )
}
