let jsdom = require("mocha-jsdom");
let expect = require("chai").expect;

describe("mocha tests", function() {

	jsdom();

	it("has document", function() {
		let div = document.createElement("div");
		expect(div.nodeName).eql("DIV");
	});

});
