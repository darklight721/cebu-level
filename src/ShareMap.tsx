import JSONCrush from 'jsoncrush'
import queryString from 'query-string'
import { useEffect, useMemo, useState } from 'react'
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TwitterIcon,
  TwitterShareButton,
} from 'react-share'
import { Button, ButtonGroup, Modal, ModalBody, ModalHeader } from 'reactstrap'
import { HOME_URL, VALUES, type Result, type Values } from './data'

type Props = {
  values: Values
  result: Result
}

function ShareMapModal({
  values,
  result,
  toggle,
}: Props & { toggle: () => void }) {
  const [valuesParam, resultParam] = useMemo(() => {
    let stringResult =
      Object.keys(result).length === 0 ? '' : JSON.stringify(result)
    let stringValues = JSON.stringify(values)

    if (stringValues === JSON.stringify(VALUES)) stringValues = ''

    return [
      stringValues ? JSONCrush.crush(stringValues) : '',
      stringResult ? JSONCrush.crush(stringResult) : '',
    ]
  }, [])
  const [type, setType] = useState(resultParam ? 1 : 2)
  const link = useMemo(() => {
    const params = queryString.stringify(
      {
        v: valuesParam,
        r: type === 1 ? resultParam : '',
      },
      { strict: false, skipEmptyString: true }
    )

    return params ? `${HOME_URL}/?${params}` : HOME_URL
  }, [type])
  const [isCopied, setCopied] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCopied(false)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }, [isCopied])

  return (
    <Modal isOpen toggle={toggle}>
      <ModalHeader toggle={toggle}>Share Map</ModalHeader>
      <ModalBody className="text-center">
        {valuesParam && resultParam && (
          <ButtonGroup className="mb-3">
            <Button
              color="primary"
              outline
              active={type === 1}
              onClick={() => setType(1)}
              className="w-50"
            >
              <strong>Share my map and result</strong>
              <div className="link-type lh-1">
                (Choose this if you want others to see what you've filled up)
              </div>
            </Button>
            <Button
              color="primary"
              outline
              active={type === 2}
              className="w-50"
              onClick={() => setType(2)}
            >
              <strong>Share my map</strong>
              <div className="link-type lh-1">
                (Choose this if you want others to fill up your map)
              </div>
            </Button>
          </ButtonGroup>
        )}
        <a
          className="d-block text-truncate btn btn-link btn-lg"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link}
        </a>
        <Button
          className="mt-3"
          onClick={() =>
            navigator.clipboard?.writeText(link).then(() => setCopied(true))
          }
        >
          {isCopied ? 'Copied' : 'Copy'} to clipboard
        </Button>
        <div className="mt-3">
          <FacebookShareButton className="m-1" url={link} quote={values.name}>
            <FacebookIcon round />
          </FacebookShareButton>
          <TwitterShareButton className="m-1" url={link} title={values.name}>
            <TwitterIcon round />
          </TwitterShareButton>
          <RedditShareButton className="m-1" url={link} title={values.name}>
            <RedditIcon round />
          </RedditShareButton>
          <EmailShareButton className="m-1" url={link} subject={values.name}>
            <EmailIcon round />
          </EmailShareButton>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default function ShareMap(props: Props) {
  const [isOpen, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Share Map</Button>
      {isOpen && <ShareMapModal {...props} toggle={() => setOpen(false)} />}
    </>
  )
}
