CREATE TABLE quiz_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(255) NOT NULL,
  question_type VARCHAR(50) DEFAULT 'text',
  answers JSON NOT NULL,
  correct_answer VARCHAR(10) NOT NULL,
  message_for_correct VARCHAR(255),
  message_for_incorrect VARCHAR(255),
  point INT DEFAULT 10
);


INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Who was the gobernadorcillo of San Fernando in 1795?',
  'text',
  '["Don Mariano Vicente Henson", "Don Ciriaco de Miranda", "Don Angel Pantaleon de Miranda", "Don Plo Rafael Nepomuceno"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is Don Angel Pantaleon de Miranda.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'What was the original name of Angeles City?',
  'text',
  '["San Rafael", "Culiat", "Pampanga", "San Fernando"]',
  '2',
  'Correct!',
  'Incorrect. The correct answer is Culiat.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'What plant symbol was officially recognized for Angeles City in 2000?',
  'text',
  '["Kuliat Vine", "Sampaguita", "Narra Tree", "Acacia"]',
  '1',
  'Correct!',
  'Incorrect. The correct answer is Kuliat Vine.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Which Archangel is the patron saint of soldiers?',
  'text',
  '["San Gabriel", "San Rafael", "San Miguel", "Santo Angel Custodio"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is San Miguel.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Who was the first gobernadorcillo of Angeles when it became a town in 1829?',
  'text',
  '["Don Angel Pantaleon de Miranda", "Don Mariano Vicente Henson", "Don Ciriaco de Miranda", "Don Juan D. Nepomuceno"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is Don Ciriaco de Miranda.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Which founder of Angeles City opened the first public dispensary in 1811?',
  'text',
  '["Don Angel Pantaleon de Miranda", "Don Mariano Vicente Henson", "Doña Rosalia de Jesus", "Ma. Agustina Henson de Nepomuceno"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is Doña Rosalia de Jesus.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'What was the significance of the branding iron (kintal) in early Angeles history?',
  'text',
  '["It was used for tattooing religious symbols", "It marked livestock and property of the Founders", "It was a tool for clearing land", "It symbolized Spanish rule"]',
  '2',
  'Correct!',
  'Incorrect. The correct answer is It marked livestock and property of the Founders.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Where are the remains of the Founders of Angeles City finally resting?',
  'text',
  '["The House of Don Ciriaco de Miranda", "The Museo ning Angeles", "Holy Rosary Parish Church", "Angeles City Hall"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is Holy Rosary Parish Church.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'Which historical figure donated land for the San Nicolas Public Market in 1855?',
  'text',
  '["Don Angel Pantaleon de Miranda", "Don Mariano Vicente Henson", "Don Ciriaco de Miranda", "Don Juan D. Nepomuceno"]',
  '2',
  'Correct!',
  'Incorrect. The correct answer is Don Mariano Vicente Henson.',
  10
);

INSERT INTO quiz_questions (question, question_type, answers, correct_answer, message_for_correct, message_for_incorrect, point)
VALUES
(
  'When was the Museo ning Angeles building declared an Important Cultural Property by the National Museum?',
  'text',
  '["1999", "2005", "2012", "2019"]',
  '3',
  'Correct!',
  'Incorrect. The correct answer is 2012.',
  10
);
