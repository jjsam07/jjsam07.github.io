import gzip, sys
from bmp2ascii import color_to_4bit_greyscale
from itertools import zip_longest

def pair(i):
	x = iter(i)
	return zip_longest(x, x, fillvalue=0b1111)

def frame_serialize(data):
	result = []
	temp = []
	metadata = 0
	index = 0
	for x in data:
		if x & 0b10000:
			metadata |= 1 << index
		temp.append(x & 0b1111)
		index += 1
		if index == 8:
			result.append(metadata)
			for a, b in pair(temp):
				result.append((a << 4) | b)
			temp = []
			metadata = 0
			index = 0
	if index != 0:
		if index % 2:
			result.append(metadata | 1 << index)
		else:
			result.append(metadata)
		for a, b in pair(temp):
			result.append((a << 4) | b)
	return bytes(result)

def run_length_encode(data):
	output_buffer = []
	current_px = data[0]
	count = 0
	skip = False
	for px in data:
		if px & 0b10000:
			skip = True
			if count > 2:
				output_buffer.append((count & 0b111) | 0b10000)
				count >>= 3
				while count != 0:
					output_buffer.append((count & 0b1111) | 0b10000)
					count >>= 4
				output_buffer.append(current_px)
			else:
				for i in range(0, count): output_buffer.append(current_px)
			output_buffer.append(px)
			count = 0
			continue
		if px == current_px:
			if skip:
				skip = False
				output_buffer.append(px)
				continue
			count += 1
		else:
			if skip:
				skip = False
				output_buffer.append(px)
				continue
			if count > 2:
				output_buffer.append((count & 0b111) | 0b10000)
				count >>= 3
				while count != 0:
					output_buffer.append((count & 0b1111) | 0b10000)
					count >>= 4
				output_buffer.append(current_px)
			else:
				for i in range(0, count): output_buffer.append(current_px)
			current_px = px
			count = 1
	if count > 2:
		output_buffer.append((count & 0b111) | 0b10000)
		count >>= 3
		while count != 0:
			output_buffer.append((count & 0b1111) | 0b10000)
			count >>= 4
		output_buffer.append(current_px)
	else:
		for i in range(0, count): output_buffer.append(current_px)
	return output_buffer

def diff(previous, current):
	if previous is None:
		return current
	if len(previous) != len(current): raise Exception('Length not equal')
	result = []
	skip = 0
	prevprev_iter = 0
	prev_iter = 0
	for prev, curr in zip(previous, current):
		if prev != curr:
			if skip > 2:
				result.append((skip & 0b111) | 0b11000)
				skip >>= 3
				while skip != 0:
					result.append((skip & 0b1111) | 0b10000)
					skip >>= 4
				result.append(0) # Insert dummy literal
			elif skip == 2:
				result.append(prevprev_iter)
				result.append(prev_iter)
				skip = 0
			elif skip == 1:
				result.append(prev_iter)
				skip = 0
			result.append(curr)
			continue
		prevprev_iter = prev_iter
		prev_iter = curr
		skip += 1
	if skip > 2:
		result.append((skip & 0b111) | 0b11000)
		skip >>= 3
		while skip != 0:
			result.append((skip & 0b1111) | 0b10000)
			skip >>= 4
		result.append(0) # Insert dummy literal
	elif skip == 2:
		result.append(prevprev_iter)
		result.append(prev_iter)
	elif skip == 1:
		result.append(prev_iter)
	return result
	
def nggyu():
	frames_dir = 'D:\\This PC\\Videos\\nggyu\\'
	data_stream = []
	prev_frame = None
	frame_bundle = 0
	count = 0
	for frame_num in range(0, 5298):
		sys.stdout.write(f'\rscene{frame_num}.bmp')
		sys.stdout.flush()
		with open(frames_dir+f'scene{frame_num}.bmp', 'rb') as fin:
			current_frame = color_to_4bit_greyscale(fin, px_array_column_start_offset=22, px_array_column_end_offset=22)[0]
			for x in run_length_encode(diff(prev_frame, current_frame)):
				data_stream.append(x)
			prev_frame = current_frame
		count += 1
		if count == 500:
			with open(f'D:\\GitHub\\jjsam07.github.io\\attlh\\frames\\frame_bundle{frame_bundle}.gz', 'wb') as fout:
				fout.write(gzip.compress(frame_serialize(data_stream)))
			data_stream = []
			count = 0
			frame_bundle += 1
		#if frame_num == 25: break
	with open(f'D:\\GitHub\\jjsam07.github.io\\attlh\\frames\\frame_bundle{frame_bundle}.gz', 'wb') as fout:
		fout.write(gzip.compress(frame_serialize(data_stream)))
	sys.stdout.write('\n')
	sys.stdout.flush()
	
if __name__ == '__main__':
	nggyu()