# Neural ODE

> 所谓神经常微分方程是什么，我也说不清楚，总之至少可以用来插值和预测。——桜井雪子

## Libraries

```python
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F

from torchdiffeq import odeint
# Library developed by the author of the original article(?)
# https://arxiv.org/abs/1806.07366
# https://github.com/rtqichen/torchdiffeq
```

## Neural ODE class

```python
class ODEFunc(nn.Module):
    def __init__(self, hidden_dim=32):
        super(ODEFunc, self).__init__()
        # Fully Connected Layer -> $tanh$ Activation Function -> Fully Connected Layer
        self.net = nn.Sequential(
            nn.Linear(1, hidden_dim),
            nn.Tanh(),
            nn.Linear(hidden_dim, 1),
        )

    def forward(self, t, y):
        return self.net(y)
```

## main

- Introduction

```python
ode_func = ODEFunc(hidden_dim=32)

t = torch.linspace(0, 5, 100)
y_true = torch.exp(-t) # fake data

optimizer = optim.Adam(ode_func.parameters(), lr=0.001)
```

- Training

```python
num_epochs = 2000
for epoch in range(num_epochs):
    optimizer.zero_grad()
    y_pred = odeint(ode_func, y_true[0:1], t).squeeze(1)
    loss = F.mse_loss(y_pred, y_true)
    loss.backward()
    optimizer.step()

    if epoch % 200 == 0:
        print(f"Epoch {epoch}, Loss: {loss.item()}")
```

- Test and prediction

```python
print(y_true.flatten())

t_test = torch.linspace(0, 5, 200)
y_test = odeint(ode_func, y_true[0:1], t_test)
print(y_test.flatten())

t_pred = torch.linspace(0, 6, 120)
y_pred = odeint(ode_func, y_true[0:1], t_pred)
print(y_pred.flatten())
```

## Reference

- [DeepSeek](https://www.deepseek.com)