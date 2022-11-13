from player import frame_deserialize, frame_decode

def main():
	for i in range(0, 11):
		with open(f'frames/frame_bundle{i}', 'rb') as fin:
			print(f'frame_bundle{i}: {frame_decode(frame_deserialize(fin.read()))}')
			
if __name__ == '__main__':
	main()