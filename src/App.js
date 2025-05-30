import { useEffect, useState, useCallback } from 'react';
import { saveResponses, getAllResponses, saveQuestions, getQuestions } from './db';
import { defaultQuestions } from './questions';
import {
  Container,
  Tab,
  Tabs,
  Form,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Toast,
  ToastContainer,
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function App() {
  const [key, setKey] = useState('form');
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [stats, setStats] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    async function loadQuestions() {
      const qs = await getQuestions();
      if (qs.length === 0) {
        await saveQuestions(defaultQuestions);
        setQuestions(defaultQuestions);
      } else {
        setQuestions(qs);
      }
    }
    loadQuestions();
  }, []);

  const assignDummyWeightage = async () => {
    const allResponses = await getAllResponses();
    const respondentIndex = Math.floor(allResponses.length / questions.length);
    const weightages = [0.06, 0.12, 0.06, 0.18, 0.02, 0.09, 0.14, 0.1, 0.15, 0.08];
    return weightages[respondentIndex % weightages.length];
  };

  const handleSubmit = async () => {
    const weightage = await assignDummyWeightage();
    const data = questions.map(q => ({
      question: q.id,
      type: q.type,
      score: q.type !== 'text' ? parseInt(responses[q.id]) || 0 : responses[q.id] || '',
      weightage,
      timestamp: new Date().toISOString(),
    }));
    await saveResponses(data);
    setToastMessage(
      `Responses saved! Your assigned weightage is ${(weightage * 100).toFixed(0)}%.`
    );
    setShowToast(true);
    setResponses({});
  };

  const calculateStats = useCallback(async () => {
    const allResponses = await getAllResponses();
    const questionStats = questions.map(q => {
      if (q.type === 'text') {
        return { question: q.label, average: 'N/A', weightedAverage: 'N/A', nps: 'N/A' };
      }
      const questionResponses = allResponses.filter(r => r.question === q.id);
      const scores = questionResponses.map(r => r.score);
      const count = scores.length;
      const simpleAverage = count ? scores.reduce((a, b) => a + b, 0) / count : 0;
      let weightedSum = 0;
      let totalWeights = 0;
      questionResponses.forEach(r => {
        weightedSum += r.score * r.weightage;
        totalWeights += r.weightage;
      });
      const weightedAverage = totalWeights ? weightedSum / totalWeights : 0;
      let nps = 'N/A';
      if (q.type === '0-10') {
        const promoters = scores.filter(s => s >= 9).length;
        const detractors = scores.filter(s => s <= 6).length;
        nps = count ? ((promoters - detractors) / count) * 100 : 0;
        nps = nps.toFixed(2);
      }
      return {
        question: q.label,
        average: simpleAverage.toFixed(2),
        weightedAverage: weightedAverage.toFixed(2),
        nps,
      };
    });
    setStats(questionStats);
  }, [questions]);

  useEffect(() => {
    if (key === 'dashboard') {
      calculateStats();
    }
  }, [key, calculateStats]);

  const renderSmileyRating = (questionId) => {
    const current = parseInt(responses[questionId]) || 0;
    const smileys = [
      { icon: '😞', label: 'Highly Dissatisfied', value: 1 },
      { icon: '😐', label: 'Dissatisfied', value: 2 },
      { icon: '🙂', label: 'Satisfied', value: 3 },
      { icon: '😃', label: 'Highly Satisfied', value: 4 },
    ];

    return (
      <div className="mt-2 row g-2">
        {smileys.map((s) => (
          <div
            key={s.value}
            className="col-6 col-md-3"
          >
            <div
              className={`d-flex flex-column align-items-center p-2 rounded smiley-container ${
                current === s.value ? 'bg-warning' : 'bg-light'
              }`}
              style={{
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
              onClick={() => setResponses({ ...responses, [questionId]: s.value })}
            >
              <span className="smiley-icon" style={{ fontSize: '1.5rem' }}>{s.icon}</span>
              {s.label && (
                <small className="text-muted mt-1 smiley-label">
                  {s.label}
                </small>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };



  const renderZeroToTenRating = (questionId) => {
    const current = responses[questionId] !== undefined ? parseInt(responses[questionId]) : null;
    const handleClick = (value) => {
      setResponses({ ...responses, [questionId]: value });
    };
    const getColorForNumber = (num) => {
      if (num >= 0 && num <= 6) return '#f44336';
      if (num >= 7 && num <= 8) return '#ec942c';
      if (num >= 9 && num <= 10) return '#4caf50';
      return '#f0f0f0';
    };

    return (
      <div className="mt-2">
        <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px', height: '10px' }}>
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: getColorForNumber(i),
                border: '1px solid white',
              }}
            />
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          {Array.from({ length: 11 }, (_, i) => i).map((num) => {
            const isSelected = current === num;
            const bgColor = isSelected ? getColorForNumber(num) : '#f0f0f0';
            const textColor = isSelected && num !== 7 && num !== 8 ? 'white' : 'black';

            return (
              <div
                key={num}
                onClick={() => handleClick(num)}
                className="d-flex align-items-center justify-content-center border rounded"
                style={{
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  fontWeight: 'bold',
                  backgroundColor: bgColor,
                  borderColor: '#bdbdbd',
                  color: textColor,
                }}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Container className="mt-4">
      <div className="text-center mb-4">
        <h1 className="fw-bold" style={{ color: '#1976d2' }}>
          Feedback Form
        </h1>
        <p className="text-muted">
          Consumer Feedback App for collecting and analyzing feedback from distributors
        </p>
      </div>

      <Tabs
        activeKey={key}
        onSelect={k => setKey(k)}
        className="mb-3 shadow-sm rounded border"
        fill
        variant="pills"
      >
        <Tab eventKey="form" title="Feedback Form">
          <Card className="p-4 shadow-sm border-0">
            <h4 className="fw-bold mb-3" style={{ color: '#1976d2' }}>
              Please fill out the feedback form
            </h4>
            <Form>
              {Object.entries(
                questions.reduce((acc, question) => {
                  if (!acc[question.Bucket]) {
                    acc[question.Bucket] = [];
                  }
                  acc[question.Bucket].push(question);
                  return acc;
                }, {})
              ).map(([bucketName, bucketQuestions]) => (
                <div key={bucketName} className="mb-4">
                  <h5 className="fw-semibold mt-3 mb-3 text-primary">{bucketName}</h5>
                  {bucketQuestions.map((q) => {
                    let header = null;
                    let questionLabel = q.label;

                    if (q.label.includes("How satisfied are you with L'Oréal in each of the following areas:")) {
                      const parts = q.label.split(':');
                      if (parts.length > 1) {
                        header = parts[0] + ':';
                        questionLabel = parts.slice(1).join(':').trim();
                      }
                    }

                    return (
                      <div key={q.id} className="mb-3">
                        {header && (
                          <Card className="mb-2 shadow-sm border-0" style={{ background: '#f9f9f9' }}>
                            <Card.Body>
                              <Card.Title className="fw-semibold fs-6 mb-2">
                                {header}
                              </Card.Title>
                            </Card.Body>
                          </Card>
                        )}
                        <Card className="shadow-sm border-0" style={{ background: '#f9f9f9' }}>
                          <Card.Body>
                            <Card.Title className="fw-semibold fs-6 mb-2">
                               {questionLabel.split(':')[0]} : 
                               <span className="text-muted">{questionLabel.split(':')[1]}</span>
                           </Card.Title>
                            {q.type === 'text' ? (
                              <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Type your response..."
                                className="rounded-3 shadow-sm mt-2"
                                style={{ resize: 'none' }}
                                value={responses[q.id] || ''}
                                onChange={(e) =>
                                  setResponses({ ...responses, [q.id]: e.target.value })
                                }
                              />
                            ) : q.type === '1-4' ? (
                              renderSmileyRating(q.id)
                            ) : (
                              renderZeroToTenRating(q.id)
                            )}
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="text-center mt-4">
                <Button
                  variant="primary"
                  className="rounded-pill px-4 py-2 fw-semibold"
                  onClick={handleSubmit}
                  style={{ backgroundColor: '#1976d2', border: 'none' }}
                >
                  <i className="bi bi-send-fill me-2"></i>Submit Feedback
                </Button>
              </div>
            </Form>
          </Card>
        </Tab>

        <Tab eventKey="dashboard" title="Dashboard">
          <Row className="mt-4">
            {stats.map(stat => (
              <Col md={6} key={stat.question}>
                <Card
                  className="mb-3 shadow border-0"
                  style={{ background: '#f8f9fa' }}
                >
                  <Card.Body>
                    <Card.Title
                      className="fw-bold mb-3"
                      style={{ color: '#0d6efd' }}
                    >
                      <i className="bi bi-bar-chart-fill me-2"></i>
                      {stat.question}
                    </Card.Title>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Simple Average</span>
                      <Badge bg="secondary" className="fs-6">
                        {stat.average}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Weighted Average</span>
                      <Badge bg="info" className="fs-6">
                        {stat.weightedAverage}
                      </Badge>
                    </div>
                    {stat.nps !== 'N/A' && (
                      <div className="d-flex justify-content-between align-items-center">
                        <span>Net Promoter Score</span>
                        <Badge
                          bg={parseFloat(stat.nps) >= 0 ? 'success' : 'danger'}
                          className="fs-6"
                        >
                          {stat.nps}%
                        </Badge>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Tab>
      </Tabs>

      <ToastContainer
        position="top-center"
        className="p-3"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1055 }}
      >
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Success</strong>
            <small>Now</small>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}
