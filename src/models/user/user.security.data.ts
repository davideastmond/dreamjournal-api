export type TSecurityQuestionTemplate = {
  id: string;
  prompt: string;
};

export const SECURITY_QUESTION_TEMPLATES: Array<TSecurityQuestionTemplate> = [
  {
    prompt: "What is the name of your favorite sports team?",
    id: "A0",
  },
  { prompt: "In what city were you born?", id: "A1" },
  { prompt: "What is the name of your favorite pet?", id: "A2" },
  { prompt: "What is your mother's maiden name?", id: "A3" },
  { prompt: "What high school did you attend?", id: "A4" },
  { prompt: "What is the name of your first school?", id: "A5" },
  { prompt: "What was the make of your first car?", id: "A6" },
  { prompt: "What was your favorite food as a child?", id: "A7" },
  { prompt: "Where did you meet your spouse?", id: "A8" },
];

export type TUserSecurityQuestionsPutRequestData = {
  q0: {
    selectedQuestionId: string;
    selectedQuestionPrompt: string;
    id: string;
    response: string;
  };
  q1: {
    selectedQuestionId: string;
    selectedQuestionPrompt: string;
    id: string;
    response: string;
  };
  q2: {
    selectedQuestionId: string;
    selectedQuestionPrompt: string;
    id: string;
    response: string;
  };
};
