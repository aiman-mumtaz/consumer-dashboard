import { useEffect, useState, useCallback } from 'react';
import { saveResponses, getAllResponses, saveQuestions, getQuestions } from './db';
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
        const defaultQuestions = [
          {
            id: 1,
            Bucket: 'Supply Chain and Operations',
            label:
              "Stock Availability Satisfaction: L'Oréal's performance in ensuring products are available when you need them",
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 2,
            label: "On Time Delivery: L'Oréal's ability to deliver on time",
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 3,
            label:
              "Delivery Accuracy and Quality: L'Oréal's ability to deliver the correct types and quantities of SKUs without damages and expiry",
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 4,
            label:
              'Receiving Promotional Materials: How satisfied are you with receiving free items (aprons, sprays, etc.) and POS materials from L\'Oréal when you are expected to receive them?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 5,
            label:
              'Collecting Expired Stock: How efficient and timely is L\'Oréal in collecting expired and damaged stock from your warehouse after a claim is approved?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 6,
            label:
              'Store Coverage: Do you feel L\'Oréal ensures that its products are widely available in the stores you operate or distribute to?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 7,
            label:
              'What is the single most important problem L\'Oréal could solve in the area of "Supply Chain and Operations" to help your business?',
            type: 'text',
            'O/P Metric': 'Qualitative',
          },
          {
            id: 8,
            Bucket: 'Support & Communication',
            label:
              'Communication & Responsiveness: How easy it is to contact the L\'Oréal team AND how quickly do they respond?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 9,
            label:
              'Complaint Resolution Effectiveness: How effective is L\'Oréal at resolving issues you experience satisfactorily?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 10,
            label:
              'What is the single biggest challenge you\'ve faced with L\'Oréal in the area of "Support & Communication"?',
            type: 'text',
            'O/P Metric': 'Qualitative',
          },
          {
            id: 11,
            Bucket: 'Finance & Incentives',
            label:
              'On Time Credit Notes: L\'Oréal issues credit notes on time without significant delay',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 12,
            label: 'Managing Claims: How would you rate the process of periodic reconciliation?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 13,
            label:
              'Profitability with L\'Oréal: How satisified are you with the distributor margins (relative to industry practices) & the average days of inventory maintained at your end?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 14,
            label:
              'What is the single most important problem L\'Oréal could solve in the area of "Finance & Incentives" to help your business?',
            type: 'text',
            'O/P Metric': 'Qualitative',
          },
          {
            id: 15,
            Bucket: 'Technology',
            label:
              'Order Placement & Replenishment: How would you rate the replenishment (generation of order) process?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 16,
            label:
              'Raising Tickets, Claims, & Returns: How satisfied are you with the ease of initiating returns, replacements, or claims for damaged goods?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 17,
            label:
              'Information Flow: How would you rate existing process of providing visibility relating to order placement, delivery status, credit notes, and report generation?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 18,
            label:
              'Platform - Ease of Use: The digital systems and UI employed by L\'Oréal are intuitive, easy to use, and simplify work flow',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 19,
            label:
              'Secondary Orders: How satisfied are you with the ease of secondary order placements and tracking?',
            type: '1-4',
            'O/P Metric': 'Likert Scale',
          },
          {
            id: 20,
            label:
              'What is the single biggest challenge you\'ve faced with L\'Oréal in the area of "Technology"?',
            type: 'text',
            'O/P Metric': 'Qualitative',
          },
          {
            id: 21,
            Bucket: 'Overall',
            label:
              'Would you recommend to work with L\'Oréal to your professional network?',
            type: '0-10',
            'O/P Metric': 'NPS',
          },
          {
            id: 22,
            label: 'Approximately what % of your business comes from L\'Oréal products?',
            type: 'text',
            'O/P Metric': 'Numeric',
          },
          {
            id: 23,
            label: 'How satisfied are you with L\'Oréal as an overall partner?',
            type: '0-10',
            'O/P Metric': 'CSAT',
          },
          {
            id: 24,
            label:
              'How satisfied are you with L\'Oréal in each of the following areas: A. Supply Chain and Operations',
            type: '0-10',
            'O/P Metric': 'Specific CSAT',
          },
          {
            id: 25,
            label: 'B. Support & Communication',
            type: '0-10',
            'O/P Metric': 'Specific CSAT',
          },
          {
            id: 26,
            label: 'C. Finance & Incentives',
            type: '0-10',
            'O/P Metric': 'Specific CSAT',
          },
          {
            id: 27,
            label: 'D. Technology',
            type: '0-10',
            'O/P Metric': 'Specific CSAT',
          },
          {
            id: 28,
            label:
              'What is the single most important problem L\'Oréal could solve to help your business?',
            type: 'text',
            'O/P Metric': 'Qualitative'
          },
        ];
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
  }, [questions, setStats]);

  useEffect(() => {
    if (key === 'dashboard') {
      calculateStats();
    }
  }, [key, calculateStats]);

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
              {questions.map((q, idx) => (
                <Card
                  key={q.id}
                  className="mb-3 shadow-sm border-0"
                  style={{ background: '#f9f9f9' }}
                >
                  <Card.Body>
                    <Card.Title className="fw-semibold fs-6 mb-2">
                      {q.label}
                    </Card.Title>
                    {q.type === 'text' ? (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Type your response..."
                        className="rounded-3 shadow-sm mt-2"
                        style={{ resize: 'none' }}
                        value={responses[q.id] || ''}
                        onChange={e =>
                          setResponses({ ...responses, [q.id]: e.target.value })
                        }
                      />
                    ) : (
                      <Form.Control
                        type="number"
                        min={q.type === '1-4' ? 1 : 0}
                        max={q.type === '1-4' ? 4 : 10}
                        placeholder={
                          q.type === '1-4'
                            ? 'Enter a score between 1 and 4'
                            : 'Enter a score between 0 and 10'
                        }
                        className="rounded-3 shadow-sm mt-2"
                        value={responses[q.id] || ''}
                        onChange={e =>
                          setResponses({ ...responses, [q.id]: e.target.value })
                        }
                      />
                    )}
                  </Card.Body>
                </Card>
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
                        <span>Net Projected Score</span>
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

      {/* Toast for response feedback */}
      <ToastContainer position="top-center" className="p-3" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1055 }}>
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
