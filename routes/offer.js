const express = require('express')
const offerController = require('./../controllers/offerController')

const { getOfferData, createNewOffer } = offerController

const router = express.Router()

router.route('/:offerId').get(getOfferData)

router.route('/').post(createNewOffer)

module.exports = router
