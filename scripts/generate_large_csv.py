
import pandas as pd
import numpy as np

# Generate 10,000 rows of data
dates = pd.date_range(start='2020-01-01', periods=10000, freq='h')
values = np.cumsum(np.random.randn(10000)) + 1000

df = pd.DataFrame({'timestamp': dates, 'Signal': values})
df.to_csv('large_random.csv', index=False)
print("Generated large_random.csv with 10,000 rows.")
