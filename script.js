body {
  margin: 0;
  font-family: Arial;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-box {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 350px;
  text-align: center;
}

.login-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.login-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

input {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
}

.hint {
  font-size: 12px;
  color: gray;
}

@media (max-width: 600px) {
  .login-box {
    width: 90%;
  }
}
