/**
 * WorkWise AI — AI Agent Controller
 * Proxies authenticated admin requests to the Python AI Agent service.
 * Express handles JWT auth + role validation, Python handles AI logic.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Handle AI Agent request — forwards admin message to Python service
 */
export const handleAgentRequest = async (req, res) => {
  try {
    const { message, pendingConfirmation } = req.body;
    const adminId = req.user._id.toString();
    const adminName = req.user.name;
    const adminRole = req.user.role;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long. Max 5000 characters.' });
    }

    const response = await fetch(`${AI_SERVICE_URL}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.trim(),
        admin_id: adminId,
        admin_name: adminName,
        admin_role: adminRole,
        pending_confirmation: pendingConfirmation || null,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI Agent service error:', response.status, errorData);
      return res.status(response.status).json({
        error: errorData.detail || 'AI Agent service error. Please try again.'
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Agent request error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'AI service is not running. Please start the Python AI service.'
      });
    }

    res.status(500).json({ error: 'Internal server error processing agent request.' });
  }
};

/**
 * Confirm a destructive action
 */
export const confirmAgentAction = async (req, res) => {
  try {
    const { tool, args } = req.body;

    if (!tool) {
      return res.status(400).json({ error: 'Tool name is required for confirmation.' });
    }

    const response = await fetch(`${AI_SERVICE_URL}/agent/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        admin_id: req.user._id.toString(),
        admin_name: req.user.name,
        admin_role: req.user.role,
        tool,
        args: args || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.detail || 'Confirmation failed.'
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Confirm action error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get AI Agent chat history for the current admin
 */
export const getAgentHistory = async (req, res) => {
  try {
    const adminId = req.user._id.toString();
    const limit = parseInt(req.query.limit) || 50;

    const response = await fetch(
      `${AI_SERVICE_URL}/agent/history?admin_id=${adminId}&limit=${limit}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch agent history.' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Get AI Agent audit logs
 */
export const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const response = await fetch(
      `${AI_SERVICE_URL}/agent/audit?limit=${limit}`
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to fetch audit logs.' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Audit log error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

/**
 * Clear AI Agent chat history for the current admin
 */
export const clearAgentHistory = async (req, res) => {
  try {
    const adminId = req.user._id.toString();

    const response = await fetch(
      `${AI_SERVICE_URL}/agent/history?admin_id=${adminId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to clear agent history.' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Clear history error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
