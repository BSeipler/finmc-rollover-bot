const axios = require('axios')
const parser = require('xml2json')

let creativeJSON, creativeData, offerLinkOverride, creativeName, creativeFileName, creatives

const apiKey = process.env.API_KEY
const getOfferUrl = process.env.GET_OFFER_URL
const getCreativesUrl = process.env.GET_CREATIVES_URL
const createOfferUrl = process.env.CREATE_OFFER_URL
const createCampaignUrl = process.env.CREATE_CAMPAIGN_URL
const createCreativeUrl = process.env.CREATE_CREATIVE_URL
const addCreativeFileUrl = process.env.ADD_CREATIVE_FILE_URL

/*******************************************************************************
 GET ORIGINAL OFFER DATA
 *****************************************************************************/

exports.getOfferData = async (req, res, next) => {
  try {
    const { offerId } = req.params

    const getOfferConfig = {
      url: getOfferUrl,
      method: 'GET',
      params: {
        api_key: apiKey,
        offer_id: offerId,
        offer_name: '',
        advertiser_id: '0',
        vertical_id: '0',
        offer_type_id: '0',
        media_type_id: '0',
        tag_id: '0',
        start_at_row: '0',
        row_limit: '3',
        sort_field: 'offer_id',
        sort_descending: 'FALSE',
        offer_status_id: '0'
      }
    }

    // api call to get original offer data
    const offerResults = await axios(getOfferConfig)

    const offerData = JSON.parse(parser.toJson(offerResults.data))

    // send the offer data back to the client
    res.status(200).send({
      success: true,
      data: offerData
    })

    const getCreativesConfig = {
      url: getCreativesUrl,
      method: 'GET',
      params: {
        api_key: apiKey,
        creative_id: '0',
        creative_name: '',
        offer_id: offerId,
        creative_type_id: '0',
        creative_status_id: '0',
        start_at_row: '1',
        row_limit: '30',
        sort_field: 'creative_id',
        sort_descending: 'FALSE'
      }
    }

    // api call to get the original offer's creatives
    const creativeResults = await axios(getCreativesConfig)

    creativeJSON = parser.toJson(creativeResults.data)
    creativeData = JSON.parse(creativeJSON)

    creatives = creativeData.creative_export_response.creatives.creative
    next()
  } catch (error) {
    res.send(error.message)
  }
}

/*******************************************************************************
 CREATE NEW OFFER
 *****************************************************************************/

exports.createNewOffer = async (req, res, next) => {
  try {
    const {
      vertical,
      advertiser,
      offerName,
      offerLink,
      offerStatus,
      offerType,
      priceFormat,
      currency,
      clickCookieDays,
      impressionCookieDays,
      sessionRegenerationType,
      priceReceived,
      defaultPaid,
      cookieOverrideDomain,
      sessionRegenerationSeconds
    } = req.body

    const createOfferConfig = {
      method: 'GET',
      url: `${createOfferUrl}?api_key=${apiKey}&offer_id=0&advertiser_id=${advertiser}&vertical_id=${vertical}&offer_name=${offerName}&third_party_name=&offer_status_id=${offerStatus}&offer_type_id=${offerType}&currency_id=${currency}&ssl=on&click_cookie_days=${clickCookieDays}&impression_cookie_days=${impressionCookieDays}&enable_view_thru_conversions=off&click_trumps_impression=off&disable_click_deduplication=off&last_touch=off&enable_transaction_id_deduplication=off&offer_contract_name=Offer+Contract+1&price_format_id=${priceFormat}&payout=${defaultPaid}&received=${priceReceived}&received_percentage=off&offer_link=${offerLink}&thankyou_link=&offer_contract_hidden=off&preview_link=&offer_description=&restrictions=&advertiser_extended_terms=&testing_instructions=Use+a+fake+CC&tags=tagged&hidden=off&redirect_offer_contract_id=0&redirect_404=off&postbacks_only=off&pixel_html=&postback_url=&postback_url_ms_delay=0&fire_global_pixel=off&fire_pixel_on_non_paid_conversions=off&static_suppression=1&conversion_cap_behavior=0&conversion_behavior_on_redirect=0&expiration_date=12/31/2014%2013:59:59&expiration_date_modification_type=do_not_change&thumbnail_file_import_url=&allow_affiliates_to_create_creatives=off&unsubscribe_link=&from_lines=&subject_lines=&conversions_from_whitelist_only=off&allowed_media_type_modification_type=do_not_change&allowed_media_type_ids=&redirect_domain=&cookie_domain=${cookieOverrideDomain}&track_search_terms_from_non_supported_search_engines=off&auto_disposition_type=none&auto_disposition_delay_hours=0&session_regeneration_seconds=${sessionRegenerationSeconds}&session_regeneration_type_id=${sessionRegenerationType}&payout_modification_type=change&received_modification_type=change&tags_modification_type=do_not_change`
    }

    // api call to create new offer
    const createOffer = await axios(createOfferConfig)

    // grab the new offer id
    const newOfferDataJSON = parser.toJson(createOffer.data)
    const newOfferData = JSON.parse(newOfferDataJSON)
    const newOfferId = newOfferData.offer_addedit_response.success_info.offer_id

    const createCampaignConfig = {
      method: 'get',
      url: `${createCampaignUrl}?api_key=${apiKey}&campaign_id=0&affiliate_id=4&offer_id=${newOfferId}&offer_contract_id=0&media_type_id=2&third_party_name=&account_status_id=1&display_link_type_id=1&expiration_date=1/1/2022&expiration_date_modification_type=do_not_change&currency_id=1&use_offer_contract_payout=no_change&payout=${defaultPaid}&payout_update_option=do_not_change&paid=on&static_suppression=0&paid_redirects=no_change&paid_upsells=no_change&review=no_change&auto_disposition_delay_hours=-1&redirect_offer_contract_id=0&redirect_404=off&clear_session_on_conversion=off&postback_url=&postback_delay_ms=0&unique_key_hash_type=none&test_link=null&redirect_domain=null&pixel_html=null`
    }

    await axios(createCampaignConfig)

    for (let i = 1; i < creatives.length; i++) {
      creativeName = encodeURI(creatives[i].creative_name)
      offerLinkOverride = encodeURIComponent(creatives[i].offer_link_override)
      creativeFileName = creatives[i].creative_files.creative_file.creative_file_name

      if (offerLinkOverride === '%5Bobject%20Object%5D') {
        offerLinkOverride = ''
      }

      const createCreativeConfig = {
        method: 'get',
        url: `${createCreativeUrl}?api_key=${apiKey}&creative_id=0&offer_id=${newOfferId}&creative_name=${creativeName}&third_party_name=&creative_type_id=2&creative_status_id=1&width=-1&height=-1&offer_link=${offerLinkOverride}&allow_link_override=FALSE&notes=`
      }

      const createCreative = await axios(createCreativeConfig)

      // parse the new creative data to js object
      newCreativeJSON = parser.toJson(createCreative.data)
      newCreativeData = JSON.parse(newCreativeJSON)
      // grab the new creative id
      newCreativeId =
        newCreativeData.creative_addedit_response.creative_id
      creativeFileLink = encodeURIComponent(
        creatives[i].creative_files.creative_file.creative_file_link
      )

      const addCreativeFileConfig = {
        method: 'get',
        url: `${addCreativeFileUrl}?api_key=${apiKey}&creative_id=${newCreativeId}&creative_file_id=0&creative_file_import_url=${creativeFileLink}&is_preview_file=TRUE&replace_all_files=FALSE`
      }

      await axios(addCreativeFileConfig)
    }
    next()
  } catch (error) {
    console.log(error.message)
  }
}
