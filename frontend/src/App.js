import React, { useState, useEffect } from 'react';
import { Layout, Button, Input, Typography, Avatar, Space, Spin, Card } from 'antd';
import axios from 'axios';
import Cookies from 'js-cookie';
import './App.css';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const App = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [query, setQuery] = useState('');
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('/auth/userinfo');
                if (response.ok) {
                    const data = await response.json();
                    setUserInfo(data);
                } else {
                    const encodedUserInfo = Cookies.get('userinfo');
                    if (encodedUserInfo) {
                        const decodedUserInfo = JSON.parse(atob(encodedUserInfo));
                        setUserInfo(decodedUserInfo);
                        Cookies.remove('userinfo', { path: '/' });
                    }
                }
            } catch (err) {
                console.error('Error fetching user info:', err);
            }
        };
        fetchUserInfo();
    }, []);

    const handleLogin = () => {
        window.location.href = "/auth/login";
    };

    const handleLogout = () => {
        const sessionHint = Cookies.get('session_hint');
        window.location.href = `/auth/logout?session_hint=${sessionHint}`;
    };

    const handleSubmit = async () => {
        if (!query.trim()) {
            setError('Please enter a query.');
            return;
        }
        setLoading(true);
        setError('');
        setSummary('');
        try {
            const apiUrl = window.config?.apiUrl || '';
            if (!apiUrl) {
                setError('API URL not configured. Please check public/config.js');
                setLoading(false);
                return;
            }
            const response = await axios.post(apiUrl, { query });
            setSummary(response.data.summary);
        } catch (err) {
            setError('Failed to fetch summary. Please try again.');
            console.error('Error fetching summary:', err);
        }
        setLoading(false);
    };

    const formatSummary = (text) => {
        return text
            .replace(/Investments:/g, '💰 Investments:')
            .replace(/Companies:/g, '🏢 Companies:')
            .replace(/Joint Ventures:/g, '🤝 Joint Ventures:')
            .replace(/\n/g, '<br />');
    };

    return (
        <Layout className="layout">
            <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>Company Insights</Title>
                {userInfo ? (
                    <Space>
                        <Avatar src={userInfo.picture} />
                        <Text style={{ color: 'white' }}>{userInfo.name}</Text>
                        <Button type="primary" onClick={handleLogout}>Logout</Button>
                    </Space>
                ) : (
                    <Button type="primary" onClick={handleLogin}>Login</Button>
                )}
            </Header>
            <Content style={{ padding: '50px', display: 'flex', justifyContent: 'center' }}>
                <div className="site-layout-content" style={{ maxWidth: '800px', width: '100%' }}>
                    {userInfo ? (
                        <>
                            <Title level={2}>🔍 Background Research</Title>
                            <Text>Enter a natural language query about a company and its vertical to get a summary of their investments, companies, and joint ventures.</Text>
                            <TextArea
                                rows={4}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="e.g., 'Tell me about Google's investments in AI'"
                                style={{ margin: '20px 0' }}
                            />
                            <Button type="primary" onClick={handleSubmit} loading={loading} size="large">
                                Generate Summary
                            </Button>
                            {error && <Text type="danger" style={{ display: 'block', marginTop: '10px' }}>{error}</Text>}
                            {loading && <div style={{ textAlign: 'center', marginTop: '20px' }}><Spin size="large" /></div>}
                            {summary && (
                                <Card title="📝 Summary" style={{ marginTop: '20px' }}>
                                    <p dangerouslySetInnerHTML={{ __html: formatSummary(summary) }} />
                                </Card>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <Title level={2}>Welcome to Company Insights</Title>
                            <Text>Please log in to continue.</Text>
                        </div>
                    )}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Background Research App ©2025</Footer>
        </Layout>
    );
};

export default App;
