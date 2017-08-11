const express = require('express')
const cors = require('cors')
const request = require('request-promise')
const _ = require('lodash')
const app = express()
app.use(cors())

const {SYNOLOGY_HOST, SYNOLOGY_USER, SYNOLOGY_PASS} = process.env;

var session_id
var cams

const authenticate = () => request(`${SYNOLOGY_HOST}/webapi/auth.cgi?api=SYNO.API.Auth&method=Login&version=3&account=${SYNOLOGY_USER}&passwd=${SYNOLOGY_PASS}&session=SurveillanceStation&format=sid`)
  .then(JSON.parse)
  .tap(console.info)
  .then(response => session_id = response.data.sid)

const get_cameras = () => request(`${SYNOLOGY_HOST}/webapi/entry.cgi?api=SYNO.SurveillanceStation.Camera&method=List&version=3&_sid=${session_id}`)
  .then(JSON.parse)
  .tap(console.info)
  .then(response => cameras = response.data.cameras)

const get_feed_urls = () => _.map(cameras, camera => `${SYNOLOGY_HOST}/webapi/SurveillanceStation/videoStreaming.cgi?api=SYNO.SurveillanceStation.VideoStream&version=1&method=Stream&cameraId=${camera.id}&format=mjpeg&_sid=${session_id}`)

authenticate()
  .then(get_cameras)
  .then(get_feed_urls)
  .tap(console.info)
  .then(urls => cams = urls)

app.get('/', (req, res) =>
  res.json(cams)
)

app.listen(3000)
