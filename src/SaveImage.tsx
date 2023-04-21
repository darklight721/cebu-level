import html2canvas from 'html2canvas'
import { useState } from 'react'
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap'

type SaveImageModalProps = {
  dataUrl: string
  toggle: () => void
}

function SaveImageModal({ dataUrl, toggle }: SaveImageModalProps) {
  return (
    <Modal isOpen toggle={toggle}>
      <ModalHeader toggle={toggle}>Save Image</ModalHeader>
      <ModalBody className="text-center">
        <a className="btn btn-primary" href={dataUrl} download="cebulevel.png">
          Download Image
        </a>
        <p className="mt-2 lh-1">
          <small>
            🙋 If downloading image doesn't work, you can try to right click, or
            tap and hold the image, and choose save.
          </small>
        </p>
        <img className="img-fluid" src={dataUrl} alt="Cebu Level" />
      </ModalBody>
    </Modal>
  )
}

type Props = {
  onClick: () => void
}

export default function SaveImage({ onClick }: Props) {
  const [isLoading, setLoading] = useState(false)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  return (
    <>
      <Button
        color="primary"
        disabled={isLoading}
        onClick={() => {
          setLoading(true)
          html2canvas(document.body, { logging: false })
            .then((canvas) => setDataUrl(canvas.toDataURL()))
            .finally(() => setLoading(false))
          onClick()
        }}
      >
        Save Image
      </Button>
      {dataUrl && (
        <SaveImageModal dataUrl={dataUrl} toggle={() => setDataUrl(null)} />
      )}
    </>
  )
}
