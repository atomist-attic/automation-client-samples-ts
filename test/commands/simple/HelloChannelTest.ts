import "mocha"; // this is the test framework

import * as assert from "power-assert"; // this makes the test failures highly informational

import { HandlerContext } from "@atomist/automation-client";
import { HelloChannel } from "../../../src/commands/simple/HelloChannel";

// describe accepts a string description of the tests, and a function for the test
describe("HelloChannel command handler", () => {

    // each test has a description, and a function.
    // to test asynchronously, the test function accepts a callback.
    it("sends a message to #random", done => {

        // instantiate the handler
       const subject = new HelloChannel();

        // create a fake message client.
       const fakeMessageClient = {
           channelThatWasSent: undefined, // it can store what we care to verify

           // fake only the function we call
           addressChannels(message, channel) {
               this.channelThatWasSent = channel; // store what we care about
               return Promise.resolve(); // fake a return value
           },
       };

       // cast the context to the type we need
       const fakeContext = { messageClient: fakeMessageClient } as any as HandlerContext;

       // now call the method under test
       subject.handle(fakeContext)
           .then(result => {
               // Do the assertions asynchronously
               assert(fakeMessageClient.channelThatWasSent === "random");
           })
           .then(done, done); // tell the framework the test is complete, on both success and error
    });

});
