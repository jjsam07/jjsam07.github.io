#	Reference: Bits to Bitmaps: A simple walkthrough of BMP Image Format
#	From: medium.com
#
#	Block 1: File Type Data
#	This block is a BMP Header labeled as BITMAPFILEHEADER (the name comes from
#	c++ struct in Windows OS). This is the starting point of the BMP file and has
#	14 bytes width. This header contains a total of 5 fields of variable byte width.
#	These are mentioned in the below table.
#
#	Address 0x0
#
#	FileType (0x0)				2 bytes		A 2 character string value in ASCII to specify a DIB file type.
#											It must be 'BM' or '0x42 0x4D' in hexadecimals for modern
#											compatibility reasons.
#
#	FileSize (0x2)				4 bytes		An integer (unsigned) representing entire file size in bytes.
#											This value is basically the number of bytes in a BMP image file.
#
#	Reserved (0x6)				2 bytes		These 2 bytes are reserved to be utilized by an image processing
#											application to add additional meaningful information. It should be
#											initialized to '0' integer (unsigned) value.
#
#	Reserved (0x8)				2 bytes		Same as the above.
#
#	PixelDataOffset (0xA)		4 bytes		An integer (unsigned) representing the offset of actual pixel data
#											in bytes. In nutshell:- it is the number of bytes between start of
#											the file (0) and the first byte of the pixel data.
#	----						----		----
#	Total						14 bytes	Size of the BITMAPFILEHEADER in bytes.
#
#	One thing to remember is that BMP uses the little-endian system to store a
#	number (integer or float) when a number is larger than 1-byte.
#	
#	For example, 312 decimal value in 2-bytes binary is 00000001 00111000 and its
#	hex byte representation is 0x01 0x38. Similarly, in 4-bytes, it is 00000000
#	00000000 00000001 00111000 or 0x00 0x00 0x01 0x38.
#	
#	But in the little-endian system (in modern computers), the least-significant byte
#	(LSB) is stored first. Therefore, 312 decimal value in hex byte representation
#	will be 0x38 0x01 0x00 0x00 and BMP will construct binary value like
#	RHS: 0x38 <- 0x01 <- 0x00 <- 0x00 :LHS.
#
import sys, struct, random

def isprint(c):
	if (c > 0x20) and (c < 0x7E):
		return c
	else:
		return random.randrange(0x20, 0x7E)

#      0 - 31: ' '
#     32 - 63: '.'
#     64 - 95: '!'
#    96 - 127: '-'
#   128 - 159: '+'
#   160 - 191: 'V'
#   192 - 223: 'J'
#   224 - 256: 'M'


def pxAvg(f, addr, n_bytes):
	chars = b' .!-+VJMM'
	f.seek(addr)
	px1 = struct.unpack('B', f.read(1))[0]
	px2 = 0
	px3 = 0
	if n_bytes > 1: px2 = struct.unpack('B', f.read(1))[0]
	if n_bytes > 2: px3 = struct.unpack('B', f.read(1))[0]
	avg = int((((px1 + px2 + px3)/n_bytes)/255) * 8)
	return chars[avg:avg+1]

def px_color_to_greyscale(f, addr):
	chars = b' .!-+VJMM'
	f.seek(addr)
	pxB = struct.unpack('B', f.read(1))[0]
	pxG = struct.unpack('B', f.read(1))[0]
	pxR = struct.unpack('B', f.read(1))[0]
	index = int((0.2989*pxR + 0.5870*pxG + 0.1140*pxB)/32)
	return chars[index:index+1]
	
def px_color_to_3bit_greyscale(f, addr):
	f.seek(addr)
	pxB = struct.unpack('B', f.read(1))[0]
	pxG = struct.unpack('B', f.read(1))[0]
	pxR = struct.unpack('B', f.read(1))[0]
	px = int((0.2989*pxR + 0.5870*pxG + 0.1140*pxB)/32)
	return px
	
def getData(f, addr):
	f.seek(addr)
	return struct.unpack('>I', f.read(4))[0]

def pxArrStart(f):
	f.seek(0xA)
	return struct.unpack('<I', f.read(4))[0]

def imgWidth(f):
	f.seek(0x12)
	return struct.unpack('<I', f.read(4))[0]
	
def imgHeight(f):
	f.seek(0x16)
	return struct.unpack('<I', f.read(4))[0]
	
def colorDepth(f):
	f.seek(0x1C)
	return struct.unpack('<H', f.read(2))[0]

def bmp2ascii_monochrome(fin, verbose=False):
	if (imgWidth(fin) % 32) > 0:
		width = int((imgWidth(fin) + (32 - (imgWidth(fin) % 32)))/8)
	else:
		width = int(imgWidth(fin)/8)
	
	iwidth = imgWidth(fin)
	arrStart = pxArrStart(fin)
	height = imgHeight(fin)	
	pixelData = 0
	boundary = range(0, width, 4)[-1:][0]
	bitrange = 32
	output_buffer = b''
	output_buffer_lines = [] # separated as lines
	
	if verbose:
		print(f'Array start = {arrStart}')
		print(f'ByteWidth = {width}')
		print(f'Width = {imgWidth(fin)}')
		print(f'Height = {height}')
		print(f'Boundary = {boundary}')
	
	list_index = 0
	for i in range(height-1, -1, -1):
		output_buffer_lines.append(b'')
		for j in range(0, width, 4):
			if j == boundary:
				bitrange = imgWidth(fin) % 32
			pixelData = getData(fin, arrStart+j+(width*i))
			for k in range(0, bitrange):
				if (pixelData & (0x80000000 >> k)) != 0:
					output_buffer += b'  '
					output_buffer_lines[list_index] += b'  '
				else:
					output_buffer += b'##'
					output_buffer_lines[list_index] += b'##'
		output_buffer += b'\n'
		list_index += 1
		bitrange = 32
	
	return output_buffer, output_buffer_lines

def bmp2ascii_greyscale(fin, verbose=False):
	arrStart = pxArrStart(fin)
	color_depth = colorDepth(fin)
	n_bytes = int(color_depth/8)
	iwidth = imgWidth(fin)
	bwidth = n_bytes*iwidth
	height = imgHeight(fin)
	padding = [0, 3, 2, 1][(bwidth % 4)]
	px = 0
	output_buffer = b''
	output_buffer_lines = [] # separated as lines
	
	if verbose:
		print(f'Pixel array start = {arrStart}')
		print(f'Width (bytes) = {bwidth}')
		print(f'Width (px) = {iwidth}')
		print(f'Height (px) = {height}')
		print(f'Color depth = {colorDepth(fin)} bit')
		print(f'Padding = {padding} byte')
	
	list_index = 0
	for i in range(height-1, -1, -1):
		output_buffer_lines.append(b'')
		for j in range(0, iwidth):
			px = pxAvg(fin, arrStart+(j*n_bytes)+((bwidth+padding)*i), n_bytes)
			output_buffer += px
			output_buffer_lines[list_index] += px
		output_buffer += b'\n'
		list_index += 1
	
	return output_buffer, output_buffer_lines

def bmp2ascii_color(fin, verbose=False, px_array_column_start_offset=0, px_array_column_end_offset=0, px_array_row_start_offset=0, px_array_row_end_offset=0):
	arrStart = pxArrStart(fin)
	color_depth = colorDepth(fin)
	n_bytes = int(color_depth/8)
	iwidth = imgWidth(fin)
	bwidth = n_bytes*iwidth
	height = imgHeight(fin)
	padding = [0, 3, 2, 1][(bwidth % 4)]
	px = 0
	output_buffer = b''
	output_buffer_lines = [] # separated as lines
	
	if verbose:
		print(f'Pixel array start = {arrStart}')
		print(f'Width (bytes) = {bwidth}')
		print(f'Width (px) = {iwidth}')
		print(f'Height (px) = {height}')
		print(f'Color depth = {colorDepth(fin)} bit')
		print(f'Padding = {padding} byte')
	
	list_index = 0
	for i in range(height-1-px_array_row_start_offset, -1+px_array_row_end_offset, -1):
		output_buffer_lines.append(b'')
		for j in range(0+px_array_column_start_offset, iwidth-px_array_column_end_offset):
			px = px_color_to_greyscale(fin, arrStart+(j*n_bytes)+((bwidth+padding)*i))
			output_buffer += px
			output_buffer_lines[list_index] += px
		output_buffer += b'\n'
		list_index += 1
	
	return output_buffer, output_buffer_lines
	
def color_to_3bit_greyscale(fin, verbose=False, px_array_column_start_offset=0, px_array_column_end_offset=0, px_array_row_start_offset=0, px_array_row_end_offset=0):
	arrStart = pxArrStart(fin)
	color_depth = colorDepth(fin)
	n_bytes = int(color_depth/8)
	iwidth = imgWidth(fin)
	bwidth = n_bytes*iwidth
	height = imgHeight(fin)
	padding = [0, 3, 2, 1][(bwidth % 4)]
	px = 0
	output_buffer = []
	output_buffer_lines = [] # separated as lines
	
	if verbose:
		print(f'Pixel array start = {arrStart}')
		print(f'Width (bytes) = {bwidth}')
		print(f'Width (px) = {iwidth}')
		print(f'Height (px) = {height}')
		print(f'Color depth = {colorDepth(fin)} bit')
		print(f'Padding = {padding} byte')
	
	list_index = 0
	for i in range(height-1-px_array_row_start_offset, -1+px_array_row_end_offset, -1):
		output_buffer_lines.append([])
		for j in range(0+px_array_column_start_offset, iwidth-px_array_column_end_offset):
			px = px_color_to_3bit_greyscale(fin, arrStart+(j*n_bytes)+((bwidth+padding)*i))
			output_buffer.append(px)
			output_buffer_lines[list_index].append(px)
		list_index += 1
	
	return output_buffer, output_buffer_lines
	
def main():
	count = 1
	mode = 0
	for i in sys.argv:
		if i == '-o':
			fout = open(sys.argv[count], 'wb')
			count += 1
			continue
		if i == '-i':
			fin = open(sys.argv[count], 'rb')
			count += 1
			continue
		if (i == '-m') and (mode == 0):
			mode = 'm'
			count += 1
			continue
		if (i == '-g') and (mode == 0):
			mode = 'g'
			count += 1
			continue
		if (i == '-c') and (mode == 0):
			mode = 'c'
			count += 1
			continue
		count += 1
		
	if (mode == 'm'):
		fout.write(bmp2ascii_monochrome(fin)[0])
	elif (mode == 'g'):
		fout.write(bmp2ascii_greyscale(fin)[0])
	elif (mode == 'c'):
		fout.write(bmp2ascii_color(fin)[0])
	else:
		print("Specify a mode bro! (-m | -g | -c)\n")
	
	fin.close()
	fout.close()
		
def printable():
	for i in range(0, 0xFF, 1):
		print("{:X}: {:c}\n".format(i,i))

if __name__ == '__main__':
	main()
