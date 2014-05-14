#!/usr/bin/env python
#PIL( Python Imaging Library )
#from http://www.kgblog.net/2009/09/10/python-resize-picture.html

import Image
import os
import sys
import shutil

def resizeOne(input_file, output_file, rate):
    if input_file.find('.png') > 0:
        pic = Image.open(input_file).convert('RGBA')
    else:
        pic = Image.open(input_file)
    w,h = pic.size
    w,h = int(w * rate), int(h * rate)
    out = pic.resize((w, h), Image.ANTIALIAS)
    out.save(output_file)

def parse_dir(input_dir, output_dir, rate, output_ft = None):
    i_dir = os.path.abspath(input_dir)
    o_dir = os.path.abspath(output_dir)
    files = os.listdir(i_dir)
    for f in files:
        src_dir = os.path.join(i_dir, f)
        if os.path.isdir(src_dir):
            dst_dir = os.path.join(o_dir, f)
            if os.path.exists(dst_dir):
                shutil.rmtree(dst_dir)
            os.makedirs(dst_dir)
            parse_dir(src_dir, dst_dir, rate, output_ft)
        else:
            name, ext = os.path.splitext(f)
            if ext.lower() in ('.jpeg', '.jpg', '.png'):
                input_file = os.path.join(i_dir, f)
                output_file = os.path.join(o_dir, f)
                if output_ft:
                    output_file = os.path.join(o_dir, '%s.%s' % (name, output_ft))
                print "Resizing \"%s\"" % input_file
                resizeOne(input_file, output_file, rate)

def parse_args(argv):
    from argparse import ArgumentParser
    parser = ArgumentParser(prog="resize",
                            description="resize image")
    parser.add_argument("-i", metavar="INPUT_DIR", required=True, help="Set input dir")
    parser.add_argument("-o", metavar="OUTPUT_DIR", required=True, help="Set output dir")
    parser.add_argument("-r", metavar="COMPRESS_RATE", type=float, default=0.5, help="Set resize rate, default is 0.5")
    parser.add_argument("-oft", metavar="OUTPUT_FORMAT", choices=["jpeg", "png"], help="Set output format, should be [jpeg, png]")

    args = parser.parse_args(argv)
    
    input_dir = args.i
    output_dir = args.o
    rate = args.r
    output_ft = args.oft

    print 'Input: %s' % os.path.abspath(input_dir)
    print 'Ouput: %s' % os.path.abspath(output_dir)
    print 'Rate: %s' % rate
    if output_ft:
        print 'Ouput format: %s' % output_ft
    parse_dir(input_dir, output_dir, rate, output_ft)

    print 'Done!' 

if __name__ == '__main__':
    #parse_args(sys.argv[1:])
    if len(sys.argv) < 3:
        print "Arguments error!"
        print "Usage: resize <input_file> <output_file> [rate]"
        exit(1)
    i_f = os.path.abspath(sys.argv[1])
    o_f = os.path.abspath(sys.argv[2])
    rate = 0.5
    if len(sys.argv) >3:
        rate = sys.argv[3]
    resizeOne(i_f, o_f, float(rate))

