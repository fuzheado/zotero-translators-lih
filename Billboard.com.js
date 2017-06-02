{
	"translatorID": "06fbc8d6-98df-4468-ae41-8259e3b819e4",
	"label": "Billboard.com",
	"creator": "Andrew Lih",
	"target": "^https?://((www\\.)?billboard\\.com/)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsv",
	"lastUpdated": "2017-06-02 16:31:40"
}

/*
	***** BEGIN LICENSE BLOCK *****
	Copyright © 2017 Philipp Zumstein
	
	This file is part of Zotero.
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.
	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.
	***** END LICENSE BLOCK *****
*/
function detectWeb(doc, url) {
	if (ZU.xpathText(doc, '//meta[@property="og:type"]/@content')=="article") {
			return 'newspaperArticle';
	}
}

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

function scrape(doc, url) {
	var type = detectWeb(doc, url);
	var translator = Zotero.loadTranslator('web');
	// run Embedded Metadata.js
	translator.setTranslator('951c027d-74ac-47d4-a107-9c3069ab7b48');

	translator.setHandler('itemDone', function(obj, item) {
		//set proper item type
		item.itemType = type;

		//fix newlines in abstract
		item.abstractNote = ZU.trimInternal(item.abstractNote);

		//keywords
		var keywords = ZU.xpathText(doc, '//article/@data-analytics-tags');
		if (keywords && keywords.trim()) {
			item.tags = keywords.split(/,\s*/);
		}
		
		//the author extraction from EM doesn't contain much
		item.creators = [];
		
		var authors = ZU.xpathText(doc, '/html/body//a[contains(@class,"article__author-link")]');
		if (authors) {
			authorsList = authors.split(';');
			// For Billboard, cannot find multiple authored piece to test
			for (var i=0; i<authorsList.length; i++) {
				//clean authors string
				//e.g. "By Alex Spillius in Washington"
				authorsList[i] = authorsList[i].replace(/^By /, '').replace(/ in .*/, '');
				item.creators.push(ZU.cleanAuthor(authorsList[i], 'author'));
			}
		}
		
		var date = ZU.xpathText(doc, '/html/body//span[contains(@class,"js-publish-date")]/@data-pubdate-value');
		
		// date coming in as 2017052211
		// ZU.strToISO not working, so doing this instead
		if (date) {
	        date = date.slice(0,-2);    // Chop off last two extraneous digits
			date = date.insert(4,"-");  // Insert dash (see prototype above)
			date = date.insert(7,"-");  // Insert dash
			item.date = date;           // Should look like 2017-05-22
		}
		
		if (item.itemType=="newspaperArticle") {
			item.ISSN = "0006-2510";
		}
		
		item.language = "en-US";

		item.complete();
	});
	
	translator.getTranslatorObject(function(em) {
		em.addCustomFields({
		//	'DCSext.articleFirstPublished' : 'date'
		});

		em.doWeb(doc, url);
	});
	
}


function doWeb(doc, url) {
	scrape(doc, url);
}/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "http://www.billboard.com/articles/news/broadway/7801318/broadway-bromance-michael-ball-alfie-boe-interview-together",
		"items": [
           {
             "itemType": "newspaperArticle"
             "creators": [
               {
                 "firstName": "Curtis M."
                 "lastName": "Wong"
                 "creatorType": "author"
               }
             ]
             "notes": []
             "tags": [
               "Alfie Boe"
               "Michael Ball"
             ]
             "seeAlso": []
             "attachments": [
               {
                 "title": "Snapshot"
               }
             ]
             "title": "Broadway Bromance: Musical Stars Michael Ball and Alfie Boe on Their New Album and Why They'll Always Love 'Les Mis'"
             "publicationTitle": "Billboard"
             "url": "http://www.billboard.com/articles/news/broadway/7801318/broadway-bromance-michael-ball-alfie-boe-interview-together"
             "abstractNote": "Michael Ball and Alfie Boe's decision to team up for a musical project may be a logical one — it’s just a wonder it took so long."
             "libraryCatalog": "www.billboard.com"
             "date": "2017-05-22"
             "ISSN": "0006-2510"
             "language": "en-US"
             "shortTitle": "Broadway Bromance"
           }
		]
	}
]
/** END TEST CASES **/