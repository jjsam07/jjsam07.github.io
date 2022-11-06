from bmp2ascii import color_to_3bit_greyscale
from nggyu import run_length_encode, diff, pair
from player import byte_to_nibble, frame_decode, frame_update, framedata_to_image

def main():
	frames_dir = 'D:\\This PC\\Videos\\nggyu\\'
	prev_frame = None
	for frame_num in range(0, 5298):
		with open(frames_dir+f'scene{frame_num}.bmp', 'rb') as fin:
			original_frame = color_to_3bit_greyscale(fin, px_array_column_start_offset=22, px_array_column_end_offset=22)[0]
			#for x,y in pair(run_length_encode(diff(prev_frame, current_frame))):
			decoded_frame = frame_decode(run_length_encode(original_frame))
			if original_frame != decoded_frame:
				print(f'frame{frame_num} corrupted')
				print(f'original_frame len = {len(original_frame)}')
				print(f'decoded_frame len = {len(decoded_frame)}')
				with open(f'D:\\GitHub\\jjsam07.github.io\\nggyu\\frames\\original{frame_num}.txt', 'wb') as frame:
					index = 0
					for x in framedata_to_image(original_frame):
						if (index != 0) and (index % 116 == 0):
							frame.write(b'\n')
						frame.write(x)
						index += 1
				with open(f'D:\\GitHub\\jjsam07.github.io\\nggyu\\frames\\decoded{frame_num}.txt', 'wb') as frame:
					index = 0
					for x in framedata_to_image(decoded_frame):
						if (index != 0) and (index % 116 == 0):
							frame.write(b'\n')
						frame.write(x)
						index += 1
				exit()

if __name__ == '__main__':
	main()