// the program will simulate for max_days having total edges and other parameters defines in #defne macro
// output of the program will be the list of ids suspected infected and recovers
// output will be in output.txt file
// output also consits the adjacency matrix of the graph (which can be easily removed)
// output can be tweaked by little changes if necessary

#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#define total_vertices 10000                            // total number of vertices
#define max_days 300                                    // max days for simuation
#define max_edges 3000                                  //number of edges in the graph , graph is undirected              
#define trans_prob 5                                    // probabilty of transmission per edge (.5)
#define rec_prob 2                                      // probabilty of recovery (.2)


int arr[total_vertices][total_vertices] ;               // adjacency matrix of graph (total_verrtices x total_vertices)
char vert_stat[total_vertices] ;                        // status of the vertices (S , I , R) vertices are idies from 0 to 9999
int time_infect[total_vertices];                        // time of infection of the vertice... and time varies from day 0 to day max-1

// struct for event 
struct event {
    int vertice_id ;
    char action ;
    int day ;
} ;
struct event prio_que [10001] ;                         // priority queue array having 10001 size

// standard priority quue function
int p_que = 1;                                       

void Insert_p_q (struct event new ){
    int i = p_que ;
    prio_que[p_que] = new ;
    p_que++;
    while (i>1 && new.day < prio_que[i/2].day){
        prio_que[i] = prio_que[i/2] ;
        i = i/2 ;

    }
    prio_que[i] = new ;
}

void delete_p_q (){
    if (p_que == 1){
        return ;
    }
    else{
        int  i , j ;
        struct event x = prio_que[p_que-1];
        prio_que[1] = x  ;
        i = 1 ;
        j = 2*i ;

        while (j<p_que - 1) {
            if (prio_que[j].day > prio_que[j+1].day){
                j = j+1 ;
            }
            if (prio_que[i].day > prio_que[j].day){
                struct event temp = prio_que[i] ;
                prio_que[i] = prio_que[j] ;
                prio_que[j] = temp ;
                i = j  ;
                j = 2*j ;
            }
            else {
                break ;
            }
        }
        p_que-- ;
    }
}

// standard priority queue ends

// function calculates the number of days a vertice takes to recover and (assumption) vertice can not get recovered on the same day as infection
int rec_days(){
    srand(time(0));
    int days = 0 ;
    while (1){
        int k = rand()%10 ;
        days++;
        if (k<rec_prob){
            break ;
        }
    }
    return days ;
}

// function calculates the number of days a vertice takes to transmit the infection to the adjacent vertice and (assumption) vertice can not transmit on the same day as infection
int trn_days(){
    srand(time(0));
    int days = 0 ;
    while (1) {
        int k = rand()%10 ;
        days++ ;
        if (k<trans_prob){
            break;
        }
    }
    return days ;
}


// function to enque the transmission of infection to the suscpetible neighbours
void find_trans(int j , int k, int source_rec) {                // j is id of source and k is id of target and source_rec is recovery time for source
    if (vert_stat[k] == 'S'){                                   // checking if the target is susceptible
        
        int inf_time = prio_que[1].day + trn_days() ;          // calculating the transmision day(i.e. the day on which the transmit takes place)
        if (time_infect[k] > inf_time && inf_time < source_rec){    // we add the event only if transmit takes place before the source reovery and if the same event just ealry is not there
            struct event new_event ;
            new_event.vertice_id = k ;
            new_event.action = 'T' ;
            new_event.day = inf_time ;
            Insert_p_q(new_event) ;
            time_infect[k] = inf_time ;
        }
    }
}
void proc_rec () {                                      // function to set the recovery 
    vert_stat[prio_que[1].vertice_id] = 'R' ;           // setting the status of the event node as R which is recoverd
}
// function to process transmit of infection
void proces_trans(struct event to_pr){
    vert_stat[to_pr.vertice_id] = 'I' ;                 // first we set the status of the vertice as I(infected)
    int rec_time = to_pr.day + rec_days() ;             // we calculate the recovery time
    if (rec_time<max_days){                             // we only enque if the recovery time is less than max days
        struct event new_event ;
        new_event.action = 'R';
        new_event.day = rec_time ;
        new_event.vertice_id = to_pr.vertice_id ;
        Insert_p_q(new_event) ;
    }
    for (int i = 0 ; i < total_vertices ; i++) {        // we check the neighbours of the event node and enque its transmision if possible
        if (arr[to_pr.vertice_id][i] == 1){
            find_trans(to_pr.vertice_id,i,rec_time) ;
        }
    }    
}

int main (void) {
    FILE * filePointer; 
    filePointer = fopen("output.txt", "w");           // output 
    //fscanf(filePointer, "%s %s %s %d", str1, str2, str3, &year);
    srand(time(0));
    for (int i = 0 ; i < total_vertices ; i++) {            // setting every edge value zero
        for (int j = 0 ; j < total_vertices ; j++) {
            arr[i][j] = 0 ;
        }
    }

    for (int i = 0 ; i < max_edges ;) {                     // randomly creating edges
        int j = rand()%total_vertices ;                     // random vertice j
        int k = rand()%total_vertices ;                     // random vertice k
        if (j == k) {}                                      // we dont have self loop
        else if (arr[j][k] == 1){}                          // we dont have parallel loop
        else {
            arr[j][k] = 1 ;                                 // creating edge
            arr[k][j] = 1 ;
            i++ ;
        }
    }

    for (int i = 0 ; i < total_vertices ; i++) {            // printing the graph adjacency matrix
        for (int j = 0 ; j < total_vertices ; j++) {
            fprintf(filePointer,"%d ",arr[i][j]);
        }
        fprintf(filePointer,"\n") ;
    }

    

    for (int i = 0 ; i < total_vertices ; i++){             // setting initial stauts of nodes as S
        vert_stat[i] = 'S';
        time_infect[i] = max_days + 1 ;
    }

    int num_in_ini = rand()%(total_vertices+1) ;                // initial number of infected nodes and they has to be less than or equal to total number of vertices

    for (int i = 0 ; i<num_in_ini; i++){                        // setting the initial nodes as infected
        int k = (rand())%total_vertices ;
        struct event new_event ;

        new_event.day = 0 ;
        new_event.action = 'T';
        new_event.vertice_id = k ;
        time_infect[k] = 0 ;
        Insert_p_q(new_event) ;
    }
    for (int i = 0 ; i<max_days ; i++){                         // running the simulation for max_days
        while (p_que > 1 && prio_que[1].day == i){              // we are process the events happeing at that day
            struct event Earlis = prio_que[1] ;                 // earliest event 
            if (Earlis.action == 'T'){                          // if the event action is of transmission 
                if (vert_stat[Earlis.vertice_id] == 'S') {      // we check whether the node is susceptible
                    proces_trans(Earlis);
                }
                delete_p_q() ;                                  // we delete the event 
            }
            else{                                               // or we process the recovery
                proc_rec() ;
                delete_p_q() ;                                  // we delete the event
            }
        }
        fprintf (filePointer,"Suspected: ") ;                   // printing the suspected nodes
        for (int j = 0 ; j<total_vertices ; j++) {
            if (vert_stat[j] == 'S'){
                fprintf (filePointer,"%d ",j);
            }
        }
        fprintf (filePointer,"\n") ;
        fprintf (filePointer,"Infected: ") ;                    // printing the Inspected nodes
        for (int j = 0 ; j<total_vertices ; j++) {
            if (vert_stat[j] == 'I'){
                fprintf (filePointer,"%d ",j);
            }
        }
        fprintf (filePointer,"\n") ;
        fprintf (filePointer,"Recovered: ") ;                   // printing the recovered nodes
        for (int j = 0 ; j<total_vertices ; j++) {
            if (vert_stat[j] == 'R'){
                fprintf (filePointer,"%d ",j);
            }
        }
        fprintf (filePointer,"\n\n") ;
    }

return 0 ;
}
