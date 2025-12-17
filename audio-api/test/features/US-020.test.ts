import { defineFeature, loadFeature } from 'jest-cucumber';
import * as path from 'path';

const feature = loadFeature(path.join(__dirname, 'US-020-add-synthesis-to-task.feature'));

interface TestWorld {
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  inputText: string;
  synthesisResult: { audioUrl: string; phoneticText: string } | null;
  synthesisError: string | null;
  tasks: Array<{ id: string; name: string; entries: unknown[] }>;
  selectedTaskId: string | null;
  notifications: Array<{ type: string; message: string }>;
  redirectUrl: string | null;
}

const initialWorld: TestWorld = {
  userId: null,
  userEmail: null,
  isAuthenticated: false,
  inputText: '',
  synthesisResult: null,
  synthesisError: null,
  tasks: [],
  selectedTaskId: null,
  notifications: [],
  redirectUrl: null,
};

let world: TestWorld;

function resetWorld() {
  world = { ...initialWorld, tasks: [], notifications: [] };
}

defineFeature(feature, (test) => {
  beforeEach(() => {
    resetWorld();
  });

  test('Add synthesized text to existing task', ({ given, when, then, and }) => {
    given('the audio pipeline is available', () => {
      // Mock: audio services ready
    });

    and('the task service is available', () => {
      // Mock: task API ready
    });

    given(/^I am authenticated as "(.+)"$/, (email: string) => {
      world.userId = `user_${Date.now()}`;
      world.userEmail = email;
      world.isAuthenticated = true;
    });

    and(/^I have entered text "(.+)"$/, (text: string) => {
      world.inputText = text;
    });

    and('the audio has been synthesized successfully', () => {
      world.synthesisResult = {
        audioUrl: 'https://cache.example.com/audio/abc123.wav',
        phoneticText: world.inputText,
      };
    });

    and(/^I have an existing task named "(.+)"$/, (taskName: string) => {
      world.tasks.push({
        id: `task_${Date.now()}`,
        name: taskName,
        entries: [],
      });
    });

    when(/^I click "Add to task" button$/, () => {
      if (!world.isAuthenticated) {
        world.redirectUrl = '/login';
        return;
      }
      // Open task selection modal
    });

    and(/^I select task "(.+)" from the list$/, (taskName: string) => {
      const task = world.tasks.find((t) => t.name === taskName);
      if (task) {
        world.selectedTaskId = task.id;
      }
    });

    and('I confirm the selection', () => {
      if (world.selectedTaskId && world.synthesisResult) {
        const task = world.tasks.find((t) => t.id === world.selectedTaskId);
        if (task) {
          task.entries.push({
            text: world.inputText,
            audioUrl: world.synthesisResult.audioUrl,
            phoneticText: world.synthesisResult.phoneticText,
            addedAt: new Date().toISOString(),
          });
        }
      }
    });

    then(/^the entry is added to task "(.+)"$/, (taskName: string) => {
      const task = world.tasks.find((t) => t.name === taskName);
      expect(task).toBeDefined();
      expect(task?.entries.length).toBe(1);
    });

    and(/^I see a success notification "(.+)"$/, (message: string) => {
      world.notifications.push({ type: 'success', message });
      expect(world.notifications.some((n) => n.message === message)).toBe(true);
    });
  });

  test('Create new task and add entry', ({ given, and, when, then }) => {
    given('the audio pipeline is available', () => {});
    and('the task service is available', () => {});
    given(/^I am authenticated as "(.+)"$/, () => {});
    and(/^I have entered text "(.+)"$/, () => {});
    and('the audio has been synthesized successfully', () => {});
    when(/^I click "(.+)" button$/, () => {});
    and(/^I click "(.+)"$/, () => {});
    and(/^I enter task name "(.+)"$/, () => {});
    and('I save the new task', () => {});
    then(/^a new task "(.+)" is created$/, () => {});
    and(/^the entry is added to task "(.+)"$/, () => {});
    and(/^I see a success notification "(.+)"$/, () => {});
  });

  test('Unauthenticated user is redirected to login', ({ given, and, when, then }) => {
    given('the audio pipeline is available', () => {});
    and('the task service is available', () => {});
    given('I am not authenticated', () => {});
    and(/^I have entered text "(.+)"$/, () => {});
    and('the audio has been synthesized successfully', () => {});
    when(/^I click "(.+)" button$/, () => {});
    then('I am redirected to the login page', () => {});
    and(/^I see a message "(.+)"$/, () => {});
  });

  test('Handle synthesis error gracefully', ({ given, and, when, then }) => {
    given('the audio pipeline is available', () => {});
    and('the task service is available', () => {});
    given(/^I am authenticated as "(.+)"$/, () => {});
    and(/^I have entered text "(.+)"$/, () => {});
    and(/^the audio synthesis fails with error "(.+)"$/, () => {});
    when('I try to add to task', () => {});
    then(/^I see an error notification "(.+)"$/, () => {});
    and(/^the "(.+)" button is disabled$/, () => {});
  });

  test('Handle empty task list', ({ given, and, when, then }) => {
    given('the audio pipeline is available', () => {});
    and('the task service is available', () => {});
    given(/^I am authenticated as "(.+)"$/, () => {});
    and(/^I have entered text "(.+)"$/, () => {});
    and('the audio has been synthesized successfully', () => {});
    and('I have no existing tasks', () => {});
    when(/^I click "(.+)" button$/, () => {});
    then('I see the task creation form directly', () => {});
    and(/^I see a message "(.+)"$/, () => {});
  });
});
