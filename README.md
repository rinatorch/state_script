# Welcome to State Script 👋

With State Script, you can pull U.S. states and counties into Google Sheets quickly.

## About State Script

State Script is a Google Sheets extension built in Google Apps Script. When you add State Script to your workspace, you get an extra toolkit in your Google Sheets toolbar. The State Script dropdown menu allows users to grab county names in a given state, U.S. states or abbreviations or a list of all counties with their respective states.

I built it because I found myself Googling "list of U.S. states" or "[state] counties" far too often for all sorts of analyses and data collections. And only once I found that list would the data cleaning begin. I knew there had to be a better way.

State Script would have made a ton of my past projects just a little bit easier, whether related to election coverage, COVID-19 tracking or even an analysis of sports recreational deserts.

## How I built it and how it works

State Script was built in Google AppScript, with help from ChatGPT. State Script taps into an API in order to grab counties for each U.S. state. State Script calls on a list of states and abbreviations for other requests.

## How to add State Script to your workspace

1. Open up the Google Sheet with which you're hoping to add State Script.

1. Under the "Extensions" tab, select "Apps Script."

1. Clear out the existing code on the Code.gs file.

1. Copy and paste the contents of the state_script.gs file into the Code.gs file.

1. Select "Run." At this point, you might get a message from Google to authorize permissions. Follow Google's instruction to allow Apps Script to work inside the Google Sheet.

1. Open up the Google Sheet you were working on and the "States Toolkit" tool bar should appear. You're in!  
