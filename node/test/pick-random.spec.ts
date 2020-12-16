// /*
// This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
// Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

// The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
// */

// import { pickRandom } from 'dialog';
// import { expect } from 'chai';
// import sinon from 'sinon';

// import { ScopedRandom } from 'dialog';

// const DEFAULT_BUCKET_OF_MESSAGES = [
//   'this is a test utterrance',
//   'so is this.',
//   'give penguins more fish',
// ];

// const sandbox = sinon.createSandbox();

// describe('pickRandom', () => {
//   let mockNextRandom: sinon.SinonStub<number[]>;

//   beforeEach(async () => {
//     mockNextRandom = sandbox.stub(ScopedRandom, 'nextRandom').returns(0);
//   });

//   afterEach(() => {
//     sandbox.restore();
//     if(mockNextRandom) {
//       mockNextRandom.restore();
//     }
//   });

//   [
//     {
//       messages: DEFAULT_BUCKET_OF_MESSAGES,
//       random: 0,
//       expectIx: 0,
//     },
//     {
//       messages: DEFAULT_BUCKET_OF_MESSAGES,
//       random: 0.9999999,
//       expectIx: DEFAULT_BUCKET_OF_MESSAGES.length - 1,
//     },
//     {
//       messages: DEFAULT_BUCKET_OF_MESSAGES,
//       random: 0.34,
//       expectIx: 1,
//     },
//   ].forEach((x) => {
//     it.only(`picks random item with uniform distribution: [nMsgs: ${x.messages.length}, rand: ${x.random}, expectIx: ${x.expectIx}]`, async () => {
//       mockNextRandom.returns(x.random);
//       expect(pickRandom(x.messages)).to.eql(x.messages[x.expectIx]);
//     });
//   });
// });
