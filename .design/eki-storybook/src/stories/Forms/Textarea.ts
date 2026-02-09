import '../assets/scss/components/_textarea.scss';

export interface Textarea {
  textareaLabel: string;
}

export const createTextarea = ({
  textareaLabel,
}: Textarea): HTMLDivElement => {
  const textareaContainer = document.createElement('div');

  if (textareaLabel) {
    const label = document.createElement('label');
    label.htmlFor = 'textarea';
    label.innerText = textareaLabel;
    textareaContainer.appendChild(label);
  }

  const textarea = document.createElement('textarea');
  textarea.name = 'textarea';
  textarea.id = 'textarea';

  textareaContainer.appendChild(textarea);
  
  return textareaContainer;
};
