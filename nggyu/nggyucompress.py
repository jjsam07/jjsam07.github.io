import json, sys

def ascii_spatial_compress(uncompressed_string):
	compressed_string = ''
	current_char = uncompressed_string[0]
	count = 1
	for c in uncompressed_string[1:]:
		if c == current_char:
			count += 1
		else:
			if count > 1:
				compressed_string += hex(count)[2:]
			compressed_string += current_char
			current_char = c
			count = 1
	if count > 1:
		compressed_string += hex(count)[2:]
	compressed_string += current_char
	return compressed_string

def ascii_temporal_compress(previous_string, current_string):
	if previous_string is None:
		return '0:' + ascii_spatial_compress(current_string)
	if len(previous_string) != len(current_string): raise Exception('ascii_temporal_compress: Length not equal')
	result = ''
	count = 0
	skip = 0
	first = True
	for index in range(0, len(previous_string)):
		if previous_string[index] != current_string[index]:
			count += 1
			continue
		if count != 0:
			if first:
				result += hex(skip)[2:] + ':' + ascii_spatial_compress(current_string[index-count:index])
				first = False
			else:
				result += ' ' + hex(skip)[2:] + ':' + ascii_spatial_compress(current_string[index-count:index])
			count = 0
			skip = 1
			continue
		skip += 1
	if count != 0:
		if first:
			result += hex(skip)[2:] + ':' + ascii_spatial_compress(current_string[-count:])
		else:
			result += ' ' + hex(skip)[2:] + ':' + ascii_spatial_compress(current_string[-count:])
	return result
	
def string_difference(previous_string, current_string):
	if previous_string is None:
		return current_string
	if len(previous_string) != len(current_string): raise Exception('string_difference: Length not equal')
	result = ''
	count = 0
	for index in range(0, len(previous_string)):
		if previous_string[index] != current_string[index]:
			count += 1
			continue
		if count != 0:
			result += current_string[index-count:index]
			count = 0
		#result += '_'
	if count != 0:
		result += current_string[-count:]
	return result
	
def diff():
	fin = open('rick_scanlines.json', 'r')
	frames = json.load(fin)
	fin.seek(0)
	frames_ref = json.load(fin)
	current_frame = 0
	prev_frame = None
	prev_line = None
	for frame in frames_ref['frames']:
		current_line = 0
		for line in frame:
			if prev_frame is not None: prev_line = prev_frame[current_line]
			frames['frames'][current_frame][current_line] = string_difference(prev_line, line)
			current_line += 1
		prev_frame = frame
		current_frame += 1
		sys.stdout.write(f'\r{current_frame}')
		sys.stdout.flush()
	sys.stdout.write('\n')
	sys.stdout.flush()
	fout = open('raw_diff.json', 'w')
	json.dump(frames, fout, indent=4)
	fin.close()
	fout.close()
	
def main():
	fin = open('rick_scanlines.json', 'r')
	frames = json.load(fin)
	fin.seek(0)
	frames_ref = json.load(fin)
	current_frame = 0
	prev_frame = None
	prev_line = None
	for frame in frames_ref['frames']:
		current_line = 0
		for line in frame:
			if prev_frame is not None: prev_line = prev_frame[current_line]
			frames['frames'][current_frame][current_line] = ascii_temporal_compress(prev_line, line)
			current_line += 1
		prev_frame = frame
		current_frame += 1
		sys.stdout.write(f'\r{current_frame}')
		sys.stdout.flush()
	sys.stdout.write('\n')
	sys.stdout.flush()
	fout = open('compressed.json', 'w')
	json.dump(frames, fout, indent=4)
	fin.close()
	fout.close()
	
if __name__ == '__main__':
	main()