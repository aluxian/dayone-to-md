process.on('uncaughtException', (ex) => console.log(ex));

const path = require('path')
const fs = require('fs')
const AdmZip = require('adm-zip')
const formatDate = require('date-fns').format
const moment = require('moment-timezone')
var sanitize = require('sanitize-filename')
const { ensureDirectoriesExist } = require('./utils')

console.log('Reading journal file:', process.argv[2])
unpackDayone(process.argv[2])

function unpackDayone(jsonPath) {
    let entriesProcess = 0

    // Make sure the output directories exist
    const entriesDirectory = path.resolve('./entries')
    ensureDirectoriesExist([entriesDirectory])

    // Main json file
    const fullData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    const mdEntries = fullData.entries.map(entryToMarkdown)

    entriesProcess += mdEntries.length

    saveEntries(mdEntries, entriesDirectory)

    console.log(`${entriesProcess} entries processed!`)
}

function entryToMarkdown(entry) {
    let title = entry.text.slice(0, entry.text.indexOf('\n')).trim()
    let text = entry.text.slice(entry.text.indexOf('\n')).trim()

    if (entry.photos) {
        entry.photos.map(photo => {
            text = text.replace(
                `dayone-moment://${photo.identifier}`,
                `./static/${photo.md5}.${photo.type}`
            )
        })
    }

    let formattedEntry = {
        //id: entry.uuid,
        title,
        location: entry.location ? entry.location.placeName : '',
        latitude: entry.location ? entry.location.latitude : '',
        longitude: entry.location ? entry.location.longitude : '',
      tz: entry.timeZone,
        //weather: entry.weather ? entry.weather.conditionsDescription : '',
        // starred: entry.starred,
        // tags: entry.tags
    }

    formattedEntry.md = [getFrontMatter(formattedEntry), text.replace(/\\/g, '')].join('\n\n')
    formattedEntry.date = new Date(entry.creationDate)

    return formattedEntry
}

function saveEntries(entries, location) {
    entries.map(({ md, date, title,tz }) => {
        let fileName = sanitize(title).substring(2).trim()
        fileName = moment(date).tz(tz).format('YYYY-MM-DD') + ' ' + fileName
/*
        if (/^# \d{4}\-\d{2}\-/.test(fileName)) {
          fileName = fileName.substring(2)
          if (fileName[9] === ' ')
            fileName = fileName.substring(0, 8) + '0' + fileName.substring(8)
          if (fileName[13] ==='-')
            fileName = fileName.substring(0, 13) + '' + fileName.substring(14)
        } else {
          fileName = moment(date).tz(tz).format('YYYY-MM-DD HHmm')
        }

        var saveTo = path.join(location, `${fileName}.md`)
      var is59=false
        if (fs.existsSync(saveTo)) {
          console.log('path exists, changing from', fileName)
          if (moment(fileName, 'YYYY-MM-DD HHmm').minutes() !== 59){
            newsecs = moment(fileName, 'YYYY-MM-DD HHmm').minutes() + 1
            fileName = moment(fileName, 'YYYY-MM-DD HHmm').minutes(newsecs).format('YYYY-MM-DD HHmm')
            console.log('to ', fileName, newsecs)
          } else {
            console.log('59')
            is59=true
          }
        }

        if (is59 && fs.existsSync(saveTo)) {
          console.log('path exists, changing from', fileName)
          if (moment(fileName, 'YYYY-MM-DD HHmm').hours() !==23){
            newsecs = moment(fileName, 'YYYY-MM-DD HHmm').hours() + 1
            fileName = moment(fileName, 'YYYY-MM-DD HHmm').hours(newsecs).minutes(0).format('YYYY-MM-DD HHmm')
            console.log('to ', fileName, newsecs)
          } else {
            console.log('23')
          }
        }

        if (fileName.length !== 15)
        console.log('filename does not have 15 len', fileName)
*/
        let fileDate2 = moment(date).tz(tz).format('DD/MM/YYYY HH:mm:ss')

        saveTo = path.join(location, `${fileName}.md`)
        if (fs.existsSync(saveTo)) {
          console.log('already exists', saveTo)
          saveTo += '.DUPE.' + (Math.random()) + '.md'
        }
        fs.writeFileSync(saveTo, md.trim(), {
            encoding: 'utf8'
        })
        cp=require('child_process')
        my_cmd=`SetFile -d "${fileDate2}" "${saveTo}"`
        console.log('running', my_cmd)
        cp.execSync(my_cmd)
    })
}

function getFrontMatter(entry) {
    mt = `${entry.title.replace(/\s+/g, ' ').replace(/\\/g, '')}`
    mt = mt.substring(2).trim()
    /*if (mt.startsWith('#')) {
       firstBlank = mt.indexOf(' ')
      tag = mt.substring(0, firstBlank)
      mt = mt.substring(firstBlank+1).trim()
      mt = mt + '\n' + tag
    }*/
  return mt.trim()

}
