#!/usr/bin/env python2
# -*- coding: utf-8 -*-
"""
Created on Sat Sep 23 13:12:30 2017

@author: rodgeryuan
"""
import pandas as pd

import csv
import time

import praw
from praw.models import MoreComments

reddit = praw.Reddit(client_id='48psLN9NL1XRjg',
                     client_secret='kPAJQSO4RdllqIZnZugzQxes8fg',
                     password='password',
                     user_agent='testscript by /u/fakebot3',
                     username='gregnortonrocks')

nba = reddit.subreddit('nba')
    
links = ['https://www.reddit.com/r/nba/comments/4ovo70/game_thread_cleveland_cavaliers_33_golden_state/',
         'https://www.reddit.com/r/nba/comments/4ow6vj/game_thread_cleveland_cavaliers_33_golden_state/']

def get_comments(links):
    with open('comments.csv','wb') as csvfile:
        filewriter = csv.writer(csvfile, delimiter=',')
        filewriter.writerow(['text','time'])
        submission = reddit.submission(url= links[0])
        submission.comments.replace_more(limit=None)
        for comment in submission.comments.list():
            filewriter.writerow([comment.body.encode('ascii','ignore'),comment.created_utc])
        submission = reddit.submission(url= links[1])
        submission.comments.replace_more(limit=None)
        for comment in submission.comments.list():
            filewriter.writerow([comment.body.encode('ascii','ignore'),comment.created_utc])        
            
def filter_comments(comments):
    
    comments_filtered = comments[(comments.time < int(1466392500)) & (comments.time > int(1466381400))]
    
    return comments_filtered
    
def main():
    get_comments(links)
    comments = pd.DataFrame.read_csv('comments.csv')
    filter_comments(comments).to_csv('comments_final.csv')
    

