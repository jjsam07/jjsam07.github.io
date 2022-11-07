import sys

def byte_to_nibble(byte_array):
	result = []
	for b in byte_array:
		result.append(b >> 4)
		result.append(b & 0b1111)
	return result

def frame_decode(encoded_frame):
	result = []
	temp = 0
	shift_mult = 0
	skip = False
	remaining_bits = False
	for x in encoded_frame:
		if x & 0b1000:
			if remaining_bits:
				temp |= ((x & 0b111) << (3*shift_mult)+2)
				shift_mult += 1
				continue
			if x & 0b100:
				skip = True
			temp |= x & 0b11
			remaining_bits = True
			continue
		if temp != 0:
			if skip:
				result.append(temp << 2)
				temp = 0
				shift_mult = 0
				skip = False
				remaining_bits = False
				continue
			for i in range(0, temp):
				result.append(x)
			temp = 0
			shift_mult = 0
			remaining_bits = False
			continue
		result.append(x)
	return result
	
def framedata_to_image(framedata):
	chars = b' .!-+VJM'
	result = []
	for x in framedata:
		result.append(chars[x:x+1]*2 + b' ')
	return result

def frame_update(frame_buffer, next_frame):
	index = 0
	for x in next_frame:
		if x > 0b111:
			index += (x >> 2)
			continue
		frame_buffer[index] = x
		index += 1

def main():
	frames_dir = 'D:\\GitHub\\jjsam07.github.io\\nggyu\\frames\\'
	frame_buffer = []
	next_frame = []
	frame_buffer_len = 0
	first = True
	for frame_num in range(0, 5298):
		sys.stdout.write(f'\rframe{frame_num}')
		sys.stdout.flush()
		if first:
			with open(frames_dir+f'frame{frame_num}', 'rb') as frame:
				frame_buffer = frame_decode(byte_to_nibble(frame.read()))
			frame_buffer_len = len(frame_buffer)
			first = False
			with open(frames_dir+f'frame{frame_num}.txt', 'wb') as frame:
				index = 0
				for x in framedata_to_image(frame_buffer):
					if (index != 0) and (index % 116 == 0):
						frame.write(b'\n')
					frame.write(x)
					index += 1
			continue
		with open(frames_dir+f'frame{frame_num}', 'rb') as frame:
			next_frame = frame_decode(byte_to_nibble(frame.read()))
		frame_update(frame_buffer, next_frame)
		with open(frames_dir+f'frame{frame_num}.txt', 'wb') as frame:
				index = 0
				for x in framedata_to_image(frame_buffer):
					if (index != 0) and (index % 116 == 0):
						frame.write(b'\n')
					frame.write(x)
					index += 1

if __name__ == '__main__':
	main()