import pickle

# Đọc file tracklets2.pkl
with open('data/tracklets2.pkl', 'rb') as f:
    data = pickle.load(f)
    print("Nội dung của file tracklets2.pkl:")
    print(data)
