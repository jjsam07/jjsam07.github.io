import sys
from bmp2ascii import color_to_3bit_greyscale
from nggyu import run_length_encode, diff, pair
from player import byte_to_nibble, frame_decode, frame_update, framedata_to_image

def main():
	frames_dir = 'D:\\This PC\\Videos\\nggyu\\'
	prev_frame = None
	decoded_frame = [0 for i in range(0, 116*90)]
	for frame_num in range(0, 5298):
		sys.stdout.write(f'frame{frame_num}\r')
		sys.stdout.flush()
		with open(frames_dir+f'scene{frame_num}.bmp', 'rb') as fin:
			original_frame = color_to_3bit_greyscale(fin, px_array_column_start_offset=22, px_array_column_end_offset=22)[0]
			#decoded_frame = frame_decode(run_length_encode(original_frame)) # Test run_length_encode
			#decoded_frame = frame_decode(diff(original_frame)) # Test diff
			#frame_update(decoded_frame, frame_decode(diff(prev_frame, original_frame))) # Test diff + frame_update
			frame_update(decoded_frame, frame_decode(run_length_encode(diff(prev_frame, original_frame)))) # Test run_length_encode + diff + frame_update
			prev_frame = original_frame
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