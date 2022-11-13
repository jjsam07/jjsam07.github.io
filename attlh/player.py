import sys

def frame_deserialize(byte_array):
	result = []
	index = 4
	metadata = 0
	for b in byte_array:
		if index == 4:
			metadata = b
			index = 0
			continue
		if metadata & (1 << (index * 2)):
			result.append((b >> 4) | 0b10000)
		else:
			result.append(b >> 4)
		if metadata & (1 << ((index * 2) + 1)):
			result.append((b & 0b1111) | 0b10000)
		else:
			result.append(b & 0b1111)
		index += 1
	return result

def byte_to_nibble(byte_array):
	result = []
	for b in byte_array:
		result.append(b >> 4)
		result.append(b & 0b1111)
	return result

def frame_decode(encoded_frame):
	result = []
	frames = [] #
	count = 0 #
	temp = 0
	shift_mult = 0
	skip = False
	remaining_bits = False
	for x in encoded_frame:
		if count == 10440: #
			frames.append(result) #
			result = [] #
			count = 0 #
		if x & 0b10000:
			if remaining_bits:
				temp |= ((x & 0b1111) << (4*shift_mult)+3)
				shift_mult += 1
				continue
			if x & 0b1000:
				skip = True
			temp |= x & 0b111
			remaining_bits = True
			continue
		if temp != 0:
			if skip:
				result.append(temp << 3)
				count += temp #
				temp = 0
				shift_mult = 0
				skip = False
				remaining_bits = False
				continue
			for i in range(0, temp):
				result.append(x)
			count += temp # 
			temp = 0
			shift_mult = 0
			remaining_bits = False
			continue
		result.append(x)
		count += 1
	if count == 10440: #
		frames.append(result) #
	#return result
	return len(frames) #
	
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
	frames_dir = 'D:\\GitHub\\jjsam07.github.io\\attlh\\frames\\'
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