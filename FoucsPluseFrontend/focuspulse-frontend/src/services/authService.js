const API_URL = 'http://localhost:5102/api/Auth';

export async function loginUser(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'failed to login');
  }

 
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  

  const userId = data.id || data.Id;
  if (userId) {
    localStorage.setItem('userId', userId);
  }

  return data;
}

export async function registerUser(username, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'failed to register');
  }

  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data));
  

  const userId = data.id || data.Id;
  if (userId) {
    localStorage.setItem('userId', userId);
  }

  return data;
}