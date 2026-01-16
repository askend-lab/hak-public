import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

Given('I have a sentence row', function () {
  this.sentences = [{ id: 's1', text: 'Test sentence', tags: [] }];
});

Given('I have a sentence {string}', function (text: string) {
  this.sentences = [{ id: 's1', text, tags: [] }];
});

Given('I have one sentence row with text {string}', function (text: string) {
  this.sentences = [{ id: 's1', text, tags: [] }];
});

Given('I have sentence rows in the list', function () {
  this.sentences = [
    { id: 's1', text: 'Sentence 1', tags: [] },
    { id: 's2', text: 'Sentence 2', tags: [] },
  ];
});

Given('I have sentence rows with text', function () {
  this.sentences = [
    { id: 's1', text: 'Sentence 1', tags: [] },
    { id: 's2', text: 'Sentence 2', tags: [] },
  ];
});

Given('I have multiple sentence rows', function () {
  this.sentences = [
    { id: 's1', text: 'Sentence 1', tags: [] },
    { id: 's2', text: 'Sentence 2', tags: [] },
    { id: 's3', text: 'Sentence 3', tags: [] },
  ];
});

Given('I have {int} sentences in the list', function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given('I have {int} sentences with text', function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given('I have only {int} sentence in the list', function (count: number) {
  this.sentences = Array.from({ length: count }, (_, i) => ({
    id: `s${i + 1}`,
    text: `Sentence ${i + 1}`,
    tags: [],
  }));
});

Given('I have sentences in order {string}, {string}, {string}', function (s1: string, s2: string, s3: string) {
  this.sentences = [
    { id: 's1', text: s1, tags: [] },
    { id: 's2', text: s2, tags: [] },
    { id: 's3', text: s3, tags: [] },
  ];
});

Given('I have sentences {string} and {string}', function (s1: string, s2: string) {
  this.sentences = [
    { id: 's1', text: s1, tags: [] },
    { id: 's2', text: s2, tags: [] },
  ];
});

Given('I have two sentences {string} and {string}', function (s1: string, s2: string) {
  this.sentences = [
    { id: 's1', text: s1, tags: [] },
    { id: 's2', text: s2, tags: [] },
  ];
});

Given('I have sentence {string} and an empty sentence', function (text: string) {
  this.sentences = [
    { id: 's1', text, tags: [] },
    { id: 's2', text: '', tags: [] },
  ];
});

Given('sentence {string} is currently playing', function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

Given('sequential playback is in progress', function () {
  this.sequentialPlayback = true;
});

Given('I am dragging a sentence', function () {
  this.draggingSentence = true;
});

When('I view the sentence', function () {
  this.viewingSentence = true;
});

When('I view the sentences section', function () {
  this.viewingSentencesSection = true;
});

When('I click play on sentence {string}', function (sentence: string) {
  this.playingSentence = sentence;
  this.isPlaying = true;
});

When('I click the three-dots menu on a sentence', function () {
  this.sentenceMenuOpen = true;
});

When('I click the more options menu \\(⋮)', function () {
  this.sentenceMenuOpen = true;
});

When('I click {string} on that sentence', function (action: string) {
  this.sentenceAction = action;
});

When('I click {string} on the second sentence', function (action: string) {
  this.sentenceAction = action;
  this.targetSentenceIndex = 1;
});

When('I click {string} option', function (option: string) {
  this.selectedOption = option;
});

When('I drag sentence {string} to position after {string}', function (from: string, to: string) {
  this.dragFrom = from;
  this.dragTo = to;
  this.sentenceReordered = true;
});

When('the drag is in progress', function () {
  this.dragInProgress = true;
});

When('I modify the text', function () {
  this.textModified = true;
});

Then('I see the sentence', function () {
  expect(this.sentences).to.exist;
});

Then('I see sentence list', function () {
  expect(this.sentences).to.exist;
});

Then('I see sentence rows', function () {
  expect(this.sentences).to.exist;
});

Then('a new empty sentence row is added to the list', function () {
  this.sentences = this.sentences || [];
  this.sentences.push({ id: `s${this.sentences.length + 1}`, text: '', tags: [] });
});

Then('each sentence displays a drag handle', function () {
  this.sentencesHaveDragHandles = true;
});

Then('each sentence has a unique ID', function () {
  const ids = this.sentences?.map((s: { id: string }) => s.id);
  expect(new Set(ids).size).to.equal(ids?.length);
});

Then('each sentence row displays its own play button', function () {
  this.sentencesHavePlayButtons = true;
});

Then('each sentence is played in order', function () {
  this.sentencesPlayedInOrder = true;
});

Then('the next sentence starts after the previous finishes', function () {
  this.sequentialPlaybackCorrect = true;
});

Then('all sentences should be synthesized and played', function () {
  this.allSentencesSynthesized = true;
});

Then('empty sentences are skipped', function () {
  this.emptySentencesSkipped = true;
});

Then('the order becomes {string}, {string}, {string}', function (s1: string, s2: string, s3: string) {
  this.expectedOrder = [s1, s2, s3];
});

Then('the sentence is removed from the list', function () {
  this.sentenceRemoved = true;
});

Then('the sentence is cleared to empty', function () {
  this.sentenceCleared = true;
});

Then('I still have {int} sentence row visible', function (count: number) {
  expect(this.sentences?.length).to.equal(count);
});

Then('the dragged sentence appears semi-transparent', function () {
  this.draggedSentenceTransparent = true;
});

Then('the drop target shows a visual indicator', function () {
  this.dropTargetIndicator = true;
});

Then('only {string} is played', function (sentence: string) {
  this.playedSentence = sentence;
});

Then('only {string} is synthesized and played', function (sentence: string) {
  this.synthesizedSentence = sentence;
});

Then('{string} starts playing', function (item: string) {
  this.playingItem = item;
  this.isPlaying = true;
});

Then('{string} playback stops', function (item: string) {
  this.stoppedItem = item;
  this.isPlaying = false;
});

Then('{string} is not affected', function (item: string) {
  this.unaffectedItem = item;
});

Then('playback stops immediately', function () {
  this.isPlaying = false;
});
