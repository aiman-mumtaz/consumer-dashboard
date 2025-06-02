
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
        return {
          question: q.label,
          average: 'N/A',
          weightedAverage: 'N/A',
          nps: 'N/A',
          type: 'text',
          opMetric: q['O/P Metric'] || '',
          bucket: q.Bucket
        };
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
      if (q['O/P Metric'] === 'NPS') {
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
        type: q.type,
        opMetric: q['O/P Metric'] || '',
        bucket:q.Bucket
      };
    });
    // Sort: NPS first, then CSAT, then others
    const sortedStats = questionStats.sort((a, b) => {
      const order = ['NPS', 'CSAT'];
      const aIndex = order.indexOf(a.opMetric);
      const bIndex = order.indexOf(b.opMetric);
      if (aIndex === -1 && bIndex === -1) return 0; // both not in order
      if (aIndex === -1) return 1; // a after b
      if (bIndex === -1) return -1; // b after a
      return aIndex - bIndex; // lower index comes first
    });
    setStats(sortedStats);
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
                whiteSpace: 'nowrap'
              }}
              onClick={() => setResponses({ ...responses, [questionId]: s.value })}
            >
              <span className="smiley-icon" style={{ fontSize: '1.5rem' }}>{s.icon}</span>
              {s.label && (
                <small className="text-muted mt-1 smiley-label">{s.label}</small>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  const renderZeroToTenRating = (questionId) => {
    const current = responses[questionId] !== undefined ? parseInt(responses[questionId]) : null;
    const handleClick = (value) => setResponses({ ...responses, [questionId]: value });
    const getColorForNumber = (num) => {
      if (num <= 6) return '#f44336';
      if (num <= 8) return '#ec942c';
      if (num <= 10) return '#4caf50';
      return '#f0f0f0';
    };
    return (
      <div className="mt-2">
        <div style={{ display: 'flex', marginBottom: '5px', height: '10px' }}>
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
          {Array.from({ length: 11 }, (_, i) => {
            const isSelected = current === i;
            const bgColor = isSelected ? getColorForNumber(i) : '#f0f0f0';
            const textColor = isSelected && i !== 7 && i !== 8 ? 'white' : 'black';
            return (
              <div
                key={i}
                onClick={() => handleClick(i)}
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
                {i}
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
        <img src={process.env.PUBLIC_URL + "/L'Oréal_logo.svg.png"} alt="Logo" style={{ height: '40px', marginBottom: '20px' }} />
        <h1 className="fw-bold" style={{ color: '#1976d2' }}>Feedback Form</h1>
        <p className="text-muted">
          Please rate your level of satisfaction based on your association with L'Oréal over the past 12 months across the following areas:
        </p>
      </div>
      <Tabs activeKey={key} onSelect={setKey} className="mb-3 shadow-sm rounded border" fill variant="pills">
        <Tab eventKey="form" title="Feedback Form">
          <Card className="p-4 shadow-sm border-0">
            <h4 className="fw-bold mb-3 text-primary">Please fill out the feedback form</h4>
            <Form>
              {Object.entries(
                questions.reduce((acc, q) => {
                  acc[q.Bucket] = acc[q.Bucket] || [];
                  acc[q.Bucket].push(q);
                  return acc;
                }, {})
              ).map(([bucketName, bucketQuestions]) => (
                <div key={bucketName} className="mb-4">
                  <h5 className="fw-semibold text-primary">{bucketName}</h5>
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
                              <Card.Title className="fw-semibold fs-6 mb-2">{header}</Card.Title>
                            </Card.Body>
                          </Card>
                        )}
                        <Card className="shadow-sm border-0" style={{ background: '#f9f9f9' }}>
                          <Card.Body>
                            <Card.Title className="fw-semibold fs-6 mb-2">
                              {questionLabel.split(':')[0]}{q.type === 'text' ? '' : ':'}
                              <span className="text-muted">{questionLabel.split(':')[1]}</span>
                            </Card.Title>
                            {q.type === 'text'
                              ? <Form.Control
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
                              : q.type === '1-4'
                              ? renderSmileyRating(q.id)
                              : renderZeroToTenRating(q.id)
                            }
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="text-center mt-4">
                <Button variant="primary" className="rounded-pill px-4 py-2 fw-semibold" onClick={handleSubmit}>
                  <i className="bi bi-send-fill me-2"></i>Submit Feedback
                </Button>
              </div>
            </Form>
          </Card>
        </Tab>
        <Tab eventKey="dashboard" title="Dashboard">
          {console.log(stats)}
          <Row className="mt-4">
            {
            stats.map(stat =>
              stat.type === 'text' ? null : (
                <Col key={stat.question} xs={12} className="mb-3">
                  <Card className="shadow border-0" style={{ background: '#f8f9fa' }}>
                    <Card.Body>
                      <Card.Title className="fw-bold mb-3 text-primary">
                        <i className="bi bi-bar-chart-fill me-2"></i>{stat.question.split("How satisfied are you with L'Oréal in each of the following areas:").length > 1 ?stat.question.split("How satisfied are you with L'Oréal in each of the following areas:")[1]: stat.question.split(':')[0]}
                      </Card.Title>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Simple Average</span>
                        <Badge bg="secondary" className="fs-6">{stat.average}</Badge>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Weighted Average</span>
                        <Badge bg="info" className="fs-6">{stat.weightedAverage}</Badge>
                      </div>
                      {stat.nps !== 'N/A' && (
                        <div className="d-flex justify-content-between">
                          <span>Net Promoter Score</span>
                          <Badge bg={parseFloat(stat.nps) >= 0 ? 'success' : 'danger'} className="fs-6">
                            {stat.nps}%
                          </Badge>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              )
            )}
          </Row>
        </Tab>
      </Tabs>
      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1055 }}>
        <Toast onClose={() => setShowToast(false)} show={showToast} autohide bg="success">
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
