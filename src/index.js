const ENV = {
    API_URL: 'http://apis.data.go.kr/1262000/CountryBasicService/getCountryBasicList',
    REQ_SIZE: 10,
    SECRET_KEY: 'Your secret key'
}

const fs = require('fs')
const _ = require('lodash')
const Axios = require('axios')
const axios = Axios.create({
    baseURL: ENV.API_URL,
    timeout: 3000
})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function requestData(page = 1) {
    const params = {
        serviceKey: ENV.SECRET_KEY,
        pageNo: page,
        numOfRows: ENV.REQ_SIZE
    }
    console.log(`request data - page: ${page}`)
    return axios.get(ENV.API_URL, { params: params })
}

function parseToCountryData(data) {
    return {
        'countryName': _.get(data, 'countryName'),
        'countryEnName': _.get(data, 'countryEnName'),
        'continent': _.get(data, 'continent')
    }
}

function saveToFile(data) {
    fs.writeFileSync('countries.json', JSON.stringify(data))
}

async function collect() {
    let page = 1;
    const DATA = []
    while(true) {
        try {
            const response = await requestData(page)
            if (response && response.status === 200) {
                const data = _.get(response, 'data.response')
                if (_.get(data, 'header.resultCode') === '00') {
                    _.each(_.get(data, 'body.items.item'), item => DATA.push(parseToCountryData(item)))
                    if (_.size(DATA) >= parseInt(_.get(data, 'body.totalCount'))) {
                        break;
                    }
                }
                page++
            }
            await sleep(2000)
        } catch (e) {
            console.error(`error: ${e}`)
        }
    }

    saveToFile(DATA)
}

(async () => { await collect()})()