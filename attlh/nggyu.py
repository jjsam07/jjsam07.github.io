import sys
from bmp2ascii import color_to_3bit_greyscale
from itertools import zip_longest

def run_length_encode(data):
	output_buffer = []
	current_px = data[0]
	count = 0
	skip = False
	for px in data:
		if px & 0b1000:
			skip = True
			if count > 2:
				output_buffer.append((count & 0b11) | 0b1000)
				count >>= 2
				while count != 0:
					output_buffer.append((count & 0b111) | 0b1000)
					count >>= 3
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
				output_buffer.append((count & 0b11) | 0b1000)
				count >>= 2
				while count != 0:
					output_buffer.append((count & 0b111) | 0b1000)
					count >>= 3
				output_buffer.append(current_px)
			else:
				for i in range(0, count): output_buffer.append(current_px)
			current_px = px
			count = 1
	if count > 2:
		output_buffer.append((count & 0b11) | 0b1000)
		count >>= 2
		while count != 0:
			output_buffer.append((count & 0b111) | 0b1000)
			count >>= 3
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
				result.append((skip & 0b11) | 0b1100)
				skip >>= 2
				while skip != 0:
					result.append((skip & 0b111) | 0b1000)
					skip >>= 3
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
		result.append((skip & 0b11) | 0b1100)
		skip >>= 2
		while skip != 0:
			result.append((skip & 0b111) | 0b1000)
			skip >>= 3
		result.append(0) # Insert dummy literal
	elif skip == 2:
		result.append(prevprev_iter)
		result.append(prev_iter)
	elif skip == 1:
		result.append(prev_iter)
	return result

def pair(i):
	x = iter(i)
	return zip_longest(x, x, fillvalue=0b1111)
	
def nggyu_encoded():
	frames_dir = 'D:\\This PC\\Videos\\nggyu\\'
	output_buffer = []
	prev_frame = None
	for frame_num in range(0, 5298):
		sys.stdout.write(f'\rscene{frame_num}.bmp')
		sys.stdout.flush()
		with open(frames_dir+f'scene{frame_num}.bmp', 'rb') as fin:
			current_frame = color_to_3bit_greyscale(fin, px_array_column_start_offset=22, px_array_column_end_offset=22)[0]
			for x,y in pair(run_length_encode(diff(prev_frame, current_frame))):
				output_buffer.append((x << 4) | y)
			prev_frame = current_frame
		with open(f'D:\\GitHub\\jjsam07.github.io\\nggyu\\frames\\frame{frame_num}', 'wb') as fout:
			fout.write(bytes(output_buffer))
		output_buffer = []
		#if frame_num == 25: break
	sys.stdout.write('\n')
	sys.stdout.flush()
	#with open(f'D:\\GitHub\\bmp2ascii\\rick.bin', 'wb') as fout:
	#	fout.write(bytes(output_buffer))
	
if __name__ == '__main__':
	nggyu_encoded()