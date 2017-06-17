const express = require('express')
const cors = require('cors')
const request = require('request-promise')
const _ = require('lodash')
const app = express()
app.use(cors())

const {SYNOLOGY_IP, SYNOLOGY_PORT, SYNOLOGY_USER, SYNOLOGY_PASS} = process.env;

var session_id;

const authenticate = () => request(`http://${SYNOLOGY_IP}:${SYNOLOGY_PORT}/webapi/auth.cgi?api=SYNO.API.Auth&method=Login&version=3&account=${SYNOLOGY_USER}&passwd=${SYNOLOGY_PASS}&session=SurveillanceStation&format=sid`)
  .then(JSON.parse)
  .tap(console.info)
  .then(response => session_id = response.data.sid)

const get_cameras = () => request(`http://${SYNOLOGY_IP}:${SYNOLOGY_PORT}/webapi/entry.cgi?api=SYNO.SurveillanceStation.Camera&method=List&version=3&_sid=${session_id}`)
  .then(JSON.parse)
  .tap(console.info)
  .then(response => cameras = response.data.cameras)

const get_feed_urls = () => _.map(cameras, camera => `http://${SYNOLOGY_IP}:${SYNOLOGY_PORT}/webapi/SurveillanceStation/videoStreaming.cgi?api=SYNO.SurveillanceStation.VideoStream&version=1&method=Stream&cameraId=${camera.id}&format=mjpeg&_sid=${session_id}`)

app.get('/', (req, res) =>
  authenticate()
    .then(get_cameras)
    .then(get_feed_urls)
    .tap(console.info)
    .then(urls => res.json(urls))
)

app.listen(3000)
